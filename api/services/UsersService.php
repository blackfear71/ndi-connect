<?php
// Imports
require_once 'repositories/UsersRepository.php';

class UsersService
{
    private $db;
    private $repository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->repository = new UsersRepository($db);
    }

    /**
     * Contrôle authentification
     */
    public function checkAuth(string|null $token): array|false
    {
        return $this->repository->checkAuth($token);
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllUsers(): array
    {
        return $this->repository->getAllUsers();
    }

    /**
     * Connexion utilisateur
     */
    public function connect(array $data): array|null
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
    public function disconnect(string $login): bool
    {
        return $this->repository->updateToken($login, NULL);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createUser(string $login, array $data): bool|null
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
    public function resetPassword(string $login, int|string $id): string|null
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
    public function updatePassword(string $login, array $data): bool|null
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
    public function updateUser(string $login, array $data): bool|null
    {
        // Contrôle des données
        if (!$this->isValidUpdateUserData($data)) {
            return null;
        }

        // Récupération de l'utilisateur à modifier pour vérifier si c'est le dernier admin actif
        $user = $this->repository->getActiveUserDataById($data['id']);

        // Contrôle dernier admin actif si changement de rôle
        if ($user && $user['level'] == EnumUserRole::SUPERADMIN->value && $data['level'] != EnumUserRole::SUPERADMIN->value) {
            if ($this->repository->isLastAdmin()) {
                return false;
            }
        }

        // Modification
        $id = $data['id'];
        unset($data['id']);

        if ($this->repository->update($id, $login, $data)) {
            return true;
        }

        return null;
    }

    /**
     * Suppression logique d'un utilisateur
     */
    public function deleteUser(int|string $id, string $login): bool|null
    {
        // Récupération de l'utilisateur à supprimer pour vérifier si c'est le dernier admin actif
        $user = $this->repository->getActiveUserDataById($id);

        // Contrôle dernier admin actif si suppression
        if ($user && $user['level'] == EnumUserRole::SUPERADMIN->value) {
            if ($this->repository->isLastAdmin()) {
                return false;
            }
        }

        // Suppression logique de l'utilisateur
        if ($id && $this->repository->logicalDelete($id, $login)) {
            return true;
        }

        return null;
    }

    /**
     * Contrôle des données saisies (connexion)
     */
    private function isValidConnectionData(array $data): bool
    {
        $login = trim($data['login'] ?? '');
        $password = trim($data['password'] ?? '');

        return $login
            && $password;
    }

    /**
     * Contrôle des données saisies (création utilisateur)
     */
    private function isValidCreateUserData(array $data): bool
    {
        $login = trim($data['login'] ?? '');
        $password = trim($data['password'] ?? '');
        $confirmPassword = trim($data['confirmPassword'] ?? '');
        $level = $data['level'] ?? null;

        return $login && $password && $confirmPassword
            && $password === $confirmPassword
            && is_numeric($level) && $level >= EnumUserRole::USER->value && $level <= EnumUserRole::SUPERADMIN->value;
    }

    /**
     * Contrôle des données saisies (modification mot de passe)
     */
    private function isValidPasswordData(array $data): bool
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
    private function isValidUpdateUserData(array $data): bool
    {
        $level = $data['level'] ?? null;

        return is_numeric($level) && $level >= EnumUserRole::USER->value && $level <= EnumUserRole::SUPERADMIN->value;
    }

    /**
     * Génère un mot de passe aléatoire
     */
    private function generatePassword(int $length = 12): string
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
    private function processDataPassword(string $password): array
    {
        $sqlData = [
            'password' => password_hash($password, PASSWORD_DEFAULT)
        ];

        return $sqlData;
    }

    /**
     * Formate les données avant traitement SQL
     */
    private function processDataUser(array $data): array
    {
        $sqlData = [
            'login'    => $data['login'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'level'    => $data['level']
        ];

        return $sqlData;
    }
}
