<?php
// Imports
require_once 'models/dtos/UserOutputDTO.php';

require_once 'repositories/UsersRepository.php';

class UsersService
{
    private PDO $db;
    private UsersRepository $repository;

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
    public function checkAuth(?string $token): ?UserOutputDTO
    {
        // Contrôle des données
        if (!$token) {
            return null;
        }

        $data = $this->repository->checkAuth($token);

        if (!$data) {
            return null;
        }

        // Récupération des données utilisateur
        return new UserOutputDTO(
            id: $data->id,
            login: $data->login,
            level: $data->level
        );
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllUsers(): array
    {
        // Lecture des utilisateurs
        $data = $this->repository->getAllUsers();

        // Récupération des données utilisateurs
        return array_map(fn($user) => new UserOutputDTO(
            id: $user->id,
            login: $user->login,
            level: $user->level
        ), $data);
    }

    /**
     * Connexion utilisateur
     */
    public function connect(UserInputDTO $data): ?UserOutputDTO
    {
        // Contrôle des données
        if (!$this->isValidConnectionData($data)) {
            return null;
        }

        // Récupération de l'utilisateur pour vérifier le mot de passe
        $user = $this->repository->getActiveUserDataByLogin($data->login);

        // Contrôle mot de passe incorrect
        if (!$user || !password_verify($data->password, $user->password)) {
            return null;
        }

        // Stockage nouveau token
        $token = bin2hex(random_bytes(32));

        if (!$this->repository->updateToken($user, $token)) {
            return null;
        }

        // Récupération des données utilisateur
        return new UserOutputDTO(
            id: $user->id,
            login: $user->login,
            token: $token,
            level: $user->level
        );
    }

    /**
     * Déconnexion utilisateur
     */
    public function disconnect(string $login): bool
    {
        // Récupération de l'utilisateur
        $user = $this->repository->getActiveUserDataByLogin($login);

        // Suppression token de connexion
        return $this->repository->updateToken($user, NULL);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createUser(string $login, UserInputDTO $data): ?bool
    {
        // Contrôle des données
        if (!$this->isValidCreateUserData($data)) {
            return null;
        }

        // Contrôle login existant
        if ($this->repository->getUserDataByLogin($data->login)) {
            return false;
        }

        // Construction de l'objet
        $user = new User(
            login: $data->login,
            password: password_hash($data->password, PASSWORD_DEFAULT),
            level: $data->level,
            createdBy: $login
        );

        // Insertion
        return $this->repository->createUser($user);
    }

    /**
     * Modification d'un enregistrement
     */
    public function resetPassword(int|string $id, string $login): ?string
    {
        // Formatage des données mot de passe
        $newPassword = $this->generatePassword(15);
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);

        // Modification
        if (!$this->repository->updatePassword($id, $login, $hash)) {
            return null;
        }

        return $newPassword;
    }

    /**
     * Modification d'un enregistrement
     */
    public function updatePassword(string $login, UserInputDTO $data): ?bool
    {
        // Contrôle des données
        if (!$this->isValidPasswordData($data)) {
            return null;
        }

        // Récupération de l'utilisateur pour vérifier le mot de passe
        $user = $this->repository->getActiveUserDataByLogin($login);

        // Contrôle ancien mot de passe incorrect
        if (!$user || !password_verify($data->oldPassword, $user->password)) {
            return null;
        }

        // Formatage des données mot de passe
        $hash = password_hash($data->password, PASSWORD_DEFAULT);

        // Modification
        $data = $this->processDataPassword($data->password);

        return $this->repository->updatePassword($user->id, $user->login, $hash);
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateUser(string $login, UserInputDTO $data): ?bool
    {
        // Contrôle des données
        if (!$this->isValidUpdateUserData($data)) {
            return null;
        }

        // Récupération de l'utilisateur à modifier pour vérifier si c'est le dernier admin actif
        $user = $this->repository->getActiveUserDataById($data->id);

        // Contrôle dernier admin actif si changement de rôle
        if ($user && $user->level == EnumUserRole::SUPERADMIN->value && $data->level !== EnumUserRole::SUPERADMIN->value && $this->repository->isLastAdmin()) {
            return false;
        }

        // Construction de l'objet
        $user = new User(
            id: $user->id,
            level: $data->level,
            updatedBy: $login
        );

        // Modification
        return $this->repository->updateUser($user, $login);
    }

    /**
     * Suppression logique d'un utilisateur
     */
    public function deleteUser(int|string $id, string $login): ?bool
    {
        // Contrôle des données
        if (!$id) {
            return null;
        }

        // Récupération de l'utilisateur à supprimer pour vérifier si c'est le dernier admin actif
        $user = $this->repository->getActiveUserDataById($id);

        // Contrôle dernier admin actif si suppression
        if ($user && $user->level == EnumUserRole::SUPERADMIN->value && $this->repository->isLastAdmin()) {
            return false;
        }

        // Suppression logique de l'utilisateur
        return $this->repository->logicalDelete($id, $login);
    }

    /**
     * Contrôle des données saisies (connexion)
     */
    private function isValidConnectionData(UserInputDTO $data): bool
    {
        $login = trim($data->login ?? '');
        $password = trim($data->password ?? '');

        return $login
            && $password;
    }

    /**
     * Contrôle des données saisies (création utilisateur)
     */
    private function isValidCreateUserData(UserInputDTO $data): bool
    {
        $login = trim($data->login ?? '');
        $password = trim($data->password ?? '');
        $confirmPassword = trim($data->confirmPassword ?? '');
        $level = $data->level ?? null;

        return $login && $password && $confirmPassword
            && $password === $confirmPassword
            && is_numeric($level) && $level >= EnumUserRole::USER->value && $level <= EnumUserRole::SUPERADMIN->value;
    }

    /**
     * Contrôle des données saisies (modification mot de passe)
     */
    private function isValidPasswordData(UserInputDTO $data): bool
    {
        $oldPassword = trim($data->oldPassword ?? '');
        $newPassword = trim($data->password ?? '');
        $confirmPassword = trim($data->confirmPassword ?? '');

        return $oldPassword && $newPassword && $confirmPassword
            && $oldPassword !== $newPassword
            && $newPassword === $confirmPassword;
    }

    /**
     * Contrôle des données saisies (modification utilisateur)
     */
    private function isValidUpdateUserData(UserInputDTO $data): bool
    {
        $level = $data->level ?? null;

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
}
