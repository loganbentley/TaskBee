<?php
// Autoload our dependencies with Composer
require '../vendor/autoload.php';

class Task extends TaskbeeModel {

protected $fillable = array('taskId', 'name', 'description', 'dueDate', 'completed', 'userId');

}

?>
