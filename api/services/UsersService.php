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
     * Lecture de tous les enregistrements
     */
    public function getAllUsers()
    {
        return $this->repository->getAllUsers();
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

        // Récupération de l'utilisateur pour vérifier le mot de passe
        $user = $this->repository->getUserData($data['login']);

        // Contrôle mot de passe incorrect
        if (!$user || !password_verify($data['password'], $user['password'])) {
            return null;
        }

        // Stockage token
        $user['token'] = bin2hex(random_bytes(32));
        $update = $this->repository->updateToken($data['login'], $user['token']);

        if ($update) {
            unset($user['password']);
            return $user;
        }

        return null;
    }

    /**
     * Contrôle des données saisies
     */
    private function isValidConnectionData($data)
    {
        $login = trim($data['login'] ?? '');
        $password = trim($data['password'] ?? '');

        return $login
            && $password;
    }

    /**
     * Déconnexion utilisateur
     */
    public function disconnect($login)
    {
        return $this->repository->updateToken($login, NULL);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createUser($login, $data)
    {
        // Contrôle des données
        if (!$this->isValidCreateUserData($data)) {
            return null;
        }

        // Contrôle login existant
        if ($this->repository->getUserData($data['login'])) {
            return null;
        }

        // Insertion
        $data = $this->processDataUser($data);
        return $this->repository->create($login, $data);
    }

    /**
     * Contrôle des données saisies (création utilisateur)
     */
    private function isValidCreateUserData($data)
    {
        $login = trim($data['login'] ?? '');
        $password = trim($data['password'] ?? '');
        $confirmPassword = trim($data['confirmPassword'] ?? '');
        $level = $data['level'] ?? null;

        return $login && $password && $confirmPassword
            && $password === $confirmPassword
            && is_numeric($level) && $level >= UserRole::USER->value && $level <= UserRole::SUPERADMIN->value;
    }

    /**
     * Formate les données avant traitement SQL
     */
    private function processDataUser($data)
    {
        $sqlData = [
            'login'   => $data['login'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'level'   => $data['level']
        ];

        return $sqlData;
    }

    /**
     * Modification d'un enregistrement
     */
    public function updatePassword($login, $data)
    {
        // Contrôle des données
        if (!$this->isValidPasswordData($data)) {
            return null;
        }

        // Récupération de l'utilisateur pour vérifier le mot de passe
        $user = $this->repository->getUserData($login);

        // Contrôle ancien mot de passe incorrect
        if (!$user || !password_verify($data['oldPassword'], $user['password'])) {
            return null;
        }

        // Hashage du nouveau mot de passe
        $hashedPassword = password_hash($data['newPassword'], PASSWORD_DEFAULT);

        // Modification
        return $this->repository->updatePassword($login, $hashedPassword);
    }

    /**
     * Contrôle des données saisies (modification mot de passe)
     */
    private function isValidPasswordData($data)
    {
        $oldPassword = trim($data['oldPassword'] ?? '');
        $newPassword = trim($data['newPassword'] ?? '');
        $confirmPassword = trim($data['confirmPassword'] ?? '');

        return $oldPassword && $newPassword && $confirmPassword
            && $oldPassword !== $newPassword
            && $newPassword === $confirmPassword;
    }
}
