/* main.js
 * Javascript functions for main.html
 */

/* TEST VARIABLES */
var array_env = ["Work", "SchoolMWF", "SchoolTTh", "SocialMediaOnly"];
var array_taskNames = ["Project Name", "Do that one thing", "JUST DO IT!"];
var array_taskDates = ["10/25/2015", "11/1/2015", "10/21/2015"];
var array_tasksCompleted = ["Friends for dinner...", "I'm gonna have", "friends for dinner"];

var array_taskGoalsActive = ["Complete 10 tasks", "Score > 90% by Monday"];
var array_taskGoalsDates = ["12 DEC 2015", "21 DEC 2015"];

/* GET URLs */
var dashURL = "https://taskbee.byu.edu/index.php/dashboard";
var getTasksURL = "https://taskbee.byu.edu/index.php/task";
var getWebsitesURL = "https://taskbee.byu.edu/index.php/website";
var toggleEnvironmentURL = "https://taskbee.byu.edu/index.php/toggleEnvironment";

/* POST URLS */
var signOutURL = "https://taskbee.byu.edu/index.php/logout";
var createTaskURL = "https://taskbee.byu.edu/index.php/task";

/* HTML Snippits */

var tasksTableHeader =
    "<thead><tr><th>&nbsp;</th><th>Task</th><th>Description</th><th>Due</th></tr></thead>";

var activeEnvironment = "";

/* Functions */

window.onload = function(){

    populateDashboard();
    populateEnvironments();
    populateTasks();
    populateTasksCompleted();
    populateGoals();

    document.getElementById("save-environment").addEventListener("click", createEnvironment);
    document.getElementById("save-task").addEventListener("click", createTask);
    document.getElementById("dash-usersignin-signout").addEventListener("click", signOut);

}

/******************************************************************************
 * Setup
 *****************************************************************************/

function populateDashboard(){

    var response;
        var username;
        var firstName;
        var lastName;
        var currentPercent;

    $.get( dashURL, function( data ) {
        response = JSON.parse(data);
        console.log(response);

        if(response.success != 1){
            window.location = "signin.html";
        }

        username = response.user[0].username;
            console.log("Signed-in as " + response.user[0].username);

        firstName = response.user[0].firstName;
        lastName = response.user[0].lastName;
        currentPercent = response.user[0].currentPercent;

        document.getElementById("username").innerHTML = firstName + " " + lastName;
        document.getElementById("dash-on-task").innerHTML = currentPercent + "%";
        $('#dash-usersignin-username').removeClass('hidden');
        $('#dash-usersignin-signin').addClass('hidden');
    });
}

function populateEnvironments() {
  var url = "https://taskbee.byu.edu/index.php/environment";

  $.get( url, function( data ) {
    var data = JSON.parse(data);
    var environments = data.environments;
    var html = "";


    for (i = 0; i < environments.length; i++) {
        var activeButton = "";
        console.log(environments[i].active);
        if (environments[i].active == 1) {
          activeButton = "<input id='environment-stop-"+i+"' type='button' class='env-button-stop btn btn-danger' value='Stop' /><input id='environment-start-"+i+"' type='button' class='env-button-start btn btn-success' value='Start' style='display:none;'/>";
          $('#dash-environment').text(environments[i].name);
        }
        else {
          activeButton = "<input id='environment-stop-"+i+"' type='button' class='env-button-stop btn btn-danger' value='Stop' style='display:none;'/><input id='environment-start-"+i+"' type='button' class='env-button-start btn btn-success' value='Start' />";
        }
        html += "<tbody><tr><td><a id='environment-" + i + "' href='#' type='button' value='" + environments[i].name + "' >Edit Allowed Websites</a></td>" +
        "<td><strong>" + environments[i].name + "</strong></td>" +
        "<td>" +
        activeButton +
        "</td></tr></tbody>";

    }

    document.getElementById("env-table").innerHTML += html;

    for (j = 0; j < environments.length; j++) {
      $('#environment-' + j).click( showEnvironmentSummary(environments[j].name, environments[j].environmentId) );
      $('#environment-start-' + j).click( startEnviroment(environments[j].name, environments[j].environmentId, j) );
      $('#environment-stop-' + j).click( stopEnvironment(environments[j].name, environments[j].environmentId, j) );
    }

  });
}

function showEnvironmentSummary(name, id) {
  return function() {

    $.get( getWebsitesURL + "?environmentId=" + id , function( data ) {
        var data = JSON.parse(data);
        var websites = data.websites;

        var websiteHTML = "";
        for (i = 0; i < websites.length; i++) {
          websiteHTML += '<p>'+websites[i].domainName+'</p>';
        }

        var html = '<div id="environment-details-modal-'+id+'" class="modal fade" role="dialog">' +
                    '<div class="modal-dialog">' +
                      '<div class="modal-content">' +
                        '<div class="modal-header">' +
                          '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
                          '<h2 class="modal-title">'+name+'</h2>' +
                        '</div>' +
                          '<div class="modal-body">' +
                            '<h4>Blacklisted Sites</h4>' +
                            '<div id="blacklisted-sites-'+id+'">' +
                            websiteHTML +
                            '</div>' +
                            '<label class="form-label">URL:</label>' +
                            '<input id="environment-name-'+id+'" type="text" class="form-control">' +
                            '<br/>' +
                            '<input id="new-website-'+id+'" type="button" class="btn btn-primary" value="Add Website">' +
                          '</div>' +
                          '<div class="modal-footer">' +
                            '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
                            '<button id="save-environment" type="submit" class="btn btn-success" data-dismiss="modal">Save</button>' +
                          '</div>' +
                      '</div>' +
                    '</div>' +
                  '</div>';

        document.getElementById("modals").innerHTML = html;
        $('#environment-details-modal-'+id).modal('show');
        $('#new-website-' + id).click( function() {
          var url = $('#environment-name-'+id).val();
          var request = new XMLHttpRequest();
          request.onreadystatechange = function() {
            if (request.readyState === 4) {
              $('#blacklisted-sites-'+id).append('<p>'+url+'</p>');
              $('#environment-name-'+id).val('');
            }
          }
          request.open("POST", getWebsitesURL, true);
          request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          request.send("environmentId=" + id + "&url=" + url);
        });

      });
  };
}

function startEnviroment(name, id, elementId) {
  return function() {
    if (activeEnvironment !== "") {
      alert('You cannot start more than one environment at a time!');
    }
    else {
      $('#environment-start-'+elementId).hide();
      $('#environment-stop-'+elementId).show();
      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (request.readyState === 4) {
            activeEnvironment = name;
            $('#dash-environment').text(activeEnvironment);
        }
      }
      request.open("POST", toggleEnvironmentURL, true);
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      request.send("active=" + 1 + "&environmentId=" + id);
    }
  };
}

function stopEnvironment(name, id, elementId) {
  return function() {
    $('#environment-start-'+elementId).show();
    $('#environment-stop-'+elementId).hide();
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        activeEnvironment = "";
      }
    }
    request.open("POST", toggleEnvironmentURL, true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.send("active=" + 0 + "&environmentId=" + id);
  };
}

function populateTasks() {
    var taskTableContents = tasksTableHeader;
    var checkbox = "<input type='checkbox' />"

    $.get( getTasksURL, function( data ) {
        var data = JSON.parse(data);
        var tasks = data.tasks;
        console.log(tasks);

        taskTableContents += "<tbody>";
        for(i = 0; i < tasks.length; i++){
            taskTableContents += "<tr>" +
                "<td>" + checkbox + "</td>" +
                "<td><strong>" + tasks[i].name + "</strong></td>" +
                "<td>" + tasks[i].description + "</td>" +
                "<td>" + tasks[i].dueDate + "</td>" +
                "</tr>";
        }
        /* can change above code to disassemble parts of the date and display
         *  only the date parts (without the timestamp), but we can do that later
         */
        taskTableContents += "</tbody>";

    /*
    for(i = 0; i < array_taskNames.length; i++){
        tasks += "<tbody><tr><td><input type='checkbox' /></td>" +
        "<td>" + array_taskNames[i] + "</td>" +
        "<td>" + array_taskDates[i] + "</td></tr></tbody>";
    */

        document.getElementById("tasks-table").innerHTML = taskTableContents;
    });
}

function populateTasksCompleted(){
/*    var completed = "";

    for(i = 0; i < array_tasksCompleted.length; i++){
        completed += "<tbody><tr><td>" + array_tasksCompleted[i] + "</td>" +
        "<td>" +
        "<input type='button' class='tasks-completed-reopen' onclick='' value='Reopen' />" +
        "</td></tr></tbody>";
    }

    document.getElementById("tasks-table-completed").innerHTML = completed;
*/
}

function populateGoals() {

}

/******************************************************************************
 * App Functions
 *****************************************************************************/

function createEnvironment() {
    var url = "https://taskbee.byu.edu/index.php/environment";

    var name = document.getElementById("environment-name").value;

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      console.log(request.resultText);
    }
    request.open("POST", url, true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.send("name=" + name);
}


function createTask() {
    var title = document.getElementById("task-name").value;
    var description = document.getElementById("task-desc").value;
    var dateIn = document.getElementById("task-due").value;
    var dueDate = new Date(dateIn);//Implicitly calls .parse(dateIn)

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        console.log(request.resultText);
    }

    if(title && dateIn && (dueDate != NaN)){
        var dateString = dueDate.toISOString();
        request.open("POST", createTaskURL, true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.send("name=" + title + "&description=" + description + "&dueDate=" + dateString);

        //Reload the tasks list
        populateTasks();
    }
}

function signOut() {
    var request = new XMLHttpRequest();
    request.open("GET", signOutURL, true);
    request.send();

    /*
    username = "";
    firstName = "";
    lastName = "";
    currentPercent = "";
    */

    window.location.reload(true);
    //window.close();
}
