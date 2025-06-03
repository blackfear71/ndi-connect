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
    public function checkAuth($token)
    {
        return $this->repository->checkAuth($token);
    }

    /**
     * Connexion utilisateur
     */
    public function connect($data)
    {
        $user = $this->repository->getUserData($data['login']);

        if ($user && password_verify($data['password'], $user['password'])) {
            // Stockage token
            $user['token'] = bin2hex(random_bytes(32));
            $update = $this->repository->updateToken($data['login'], $user['token']);

            if ($update) {
                unset($user['password']);
                return $user;
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
