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
        $user = $this->repository->getActiveUserDataByLogin($data['login']);

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
        if ($this->repository->getUserDataByLogin($data['login'])) {
            return false;
        }

        // Insertion
        $data = $this->processDataUser($data);

        if ($this->repository->create($login, $data)) {
            return true;
        }

        return null;
    }

    /**
     * Modification d'un enregistrement
     */
    public function resetPassword($login, $id)
    {
        // Modification
        $newPassword = $this->generatePassword(15);
        $data = $this->processDataPassword($newPassword);

        if ($this->repository->update($id, $login, $data)) {
            return $newPassword;
        }

        return null;
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
        $user = $this->repository->getActiveUserDataByLogin($login);

        // Contrôle ancien mot de passe incorrect
        if (!$user || !password_verify($data['oldPassword'], $user['password'])) {
            return null;
        }

        // Modification
        $data = $this->processDataPassword($data['newPassword']);
        return $this->repository->update($user['id'], $login, $data);
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateUser($login, $data)
    {
        // Contrôle des données
        if (!$this->isValidUpdateUserData($data)) {
            return null;
        }

        // Récupération de l'utilisateur à modifier pour vérifier si c'est le dernier admin actif
        $user = $this->repository->getActiveUserDataById($data['id']);

        // Contrôle dernier admin actif si changement de rôle
        if ($user && $user['level'] == UserRole::SUPERADMIN->value && $data['level'] != UserRole::SUPERADMIN->value) {
            if ($this->repository->isLastAdmin()) {
                return false;
            }
        }

        // Modification et récupération des utilisateurs
        $id = $data['id'];
        unset($data['id']);

        if ($this->repository->update($id, $login, $data)) {
            return $this->getAllUsers();
        }

        return null;
    }

    /**
     * Suppression logique d'un utilisateur
     */
    public function deleteUser($id, $login)
    {
        // Récupération de l'utilisateur à supprimer pour vérifier si c'est le dernier admin actif
        $user = $this->repository->getActiveUserDataById($id);

        // Contrôle dernier admin actif si suppression
        if ($user && $user['level'] == UserRole::SUPERADMIN->value) {
            if ($this->repository->isLastAdmin()) {
                return false;
            }
        }

        // Suppression logique de l'utilisateur et récupération des utilisateurs restants
        if ($id && $this->repository->logicalDelete($id, $login)) {
            return $this->getAllUsers();
        }

        return null;
    }

    /**
     * Contrôle des données saisies (connexion)
     */
    private function isValidConnectionData($data)
    {
        $login = trim($data['login'] ?? '');
        $password = trim($data['password'] ?? '');

        return $login
            && $password;
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

    /**
     * Contrôle des données saisies (modification utilisateur)
     */
    private function isValidUpdateUserData($data)
    {
        $level = $data['level'] ?? null;

        return is_numeric($level) && $level >= UserRole::USER->value && $level <= UserRole::SUPERADMIN->value;
    }

    /**
     * Génère un mot de passe aléatoire
     */
    private function generatePassword($length = 12)
    {
        $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $charactersLength = strlen($characters);
        $password = '';

        for ($i = 0; $i < $length; $i++) {
            $password .= $characters[random_int(0, $charactersLength - 1)];
        }

        return $password;
    }

    /**
     * Formate les données avant traitement SQL
     */
    private function processDataPassword($password)
    {
        $sqlData = [
            'password' => password_hash($password, PASSWORD_DEFAULT)
        ];

        return $sqlData;
    }

    /**
     * Formate les données avant traitement SQL
     */
    private function processDataUser($data)
    {
        $sqlData = [
            'login'    => $data['login'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'level'    => $data['level']
        ];

        return $sqlData;
    }
}
