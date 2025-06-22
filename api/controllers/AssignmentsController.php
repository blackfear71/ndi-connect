<?php
require_once 'core/ResponseHelper.php';

require_once 'enums/UserRole.php';

class AssignmentsController
{
    private $service;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->service = new AssignmentsService($db);
    }
}
