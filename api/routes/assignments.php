<?php
require_once 'core/Database.php';

require_once 'controllers/AssignmentsController.php';

$database = new Database();
$db = $database->getConnection();
