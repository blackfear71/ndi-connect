<?php
require_once 'repositories/UsersRepository.php';

class UsersService
{
    private $db;
    private $repository;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->db = $db;
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
        // Contrôle des données
        if (!$this->isValidConnectionData($data)) {
            return null;
        }

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
     * Contrôle des données saisies
     */
    private function isValidConnectionData($data)
    {
        $login = trim($data['login'] ?? '');
        $password = trim($data['password'] ?? '');

        return $login && $password;
    }

    /**
     * Déconnexion utilisateur
     */
    public function disconnect($login)
    {
        return $this->repository->updateToken($login, NULL);
    }
}
