<?php
require_once 'repositories/UsersRepository.php';

class UsersService
{
    private $repository;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->repository = new UsersRepository($db);
    }

    /**
     * Contrôle authentification
     */
    public function checkAuth($login, $token)
    {
        $result = $this->repository->checkAuth($login, $token);
        return $result['count'] > 0;
    }

    /**
     * Connexion utilisateur
     */
    public function connect($data)
    {
        $userPassword = $this->repository->getUserPassword($data['login'], $data['password']);

        if ($userPassword && password_verify($data['password'], $userPassword['password'])) {
            // Stockage token
            $token = bin2hex(random_bytes(32));
            $update = $this->repository->updateToken($data['login'], $token);

            if ($update) {
                return $token;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    /**
     * Déconnexion utilisateur
     */
    public function disconnect($login)
    {
        return $this->repository->updateToken($login, NULL);
    }
}
