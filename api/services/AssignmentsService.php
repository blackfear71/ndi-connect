<?php
require_once 'repositories/AssignmentsRepository.php';

class AssignmentsService
{
    private $repository;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->repository = new AssignmentsRepository($db);
    }
}
