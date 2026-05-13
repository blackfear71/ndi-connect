<?php
// Imports
require_once 'models/dtos/UserOutputDTO.php';

require_once 'repositories/UsersRepository.php';

class UsersService
{
    private PDO $db;

    private UsersRepository $usersRepository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->usersRepository = new UsersRepository($db);
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

        $user = $this->usersRepository->checkAuth($token);

        if (!$user) {
            return null;
        }

        // Récupération des données utilisateur
        return new UserOutputDTO(
            id: $user->id,
            login: $user->login,
            level: $user->level
        );
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllUsers(): array
    {
        // Lecture des utilisateurs
        $users = $this->usersRepository->getAllUsers();

        // Récupération des données utilisateurs
        return array_map(fn($user) => new UserOutputDTO(
            id: $user->id,
            login: $user->login,
            level: $user->level
        ), $users);
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
        $user = $this->usersRepository->getActiveUserDataByLogin($data->login);

        // Contrôle mot de passe incorrect
        if (!$user || !password_verify($data->password, $user->password)) {
            return null;
        }

        // Stockage nouveau token
        $token = bin2hex(random_bytes(32));

        if (!$this->usersRepository->updateToken($user->id, $token)) {
            return null;
        }

        // Récupération des données utilisateur
        return new UserOutputDTO(
            id: $user->id,
            login: trim($user->login),
            token: trim($token),
            level: $user->level
        );
    }

    /**
     * Déconnexion utilisateur
     */
    public function disconnect(int $userId): ?bool
    {
        // Contrôle des données
        if (!$userId) {
            return null;
        }

        // Récupération de l'utilisateur
        $user = $this->usersRepository->getActiveUserDataById($userId);

        // Contrôle utilisateur récupéré
        if (!$user) {
            return null;
        }

        // Suppression token de connexion
        return $this->usersRepository->updateToken($user->id, NULL);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createUser(UserInputDTO $data, int $userId): ?bool
    {
        // Contrôle des données
        if (!$this->isValidCreateUserData($data)) {
            return null;
        }

        // Contrôle login existant
        if (!$this->usersRepository->checkLoginAvailable($data->login)) {
            return false;
        }

        // Construction de l'objet
        $user = new User(
            login: trim($data->login),
            password: password_hash(trim($data->password), PASSWORD_DEFAULT),
            level: $data->level,
            createdBy: $userId
        );

        // Insertion
        return $this->usersRepository->createUser($user);
    }

    /**
     * Modification d'un enregistrement
     */
    public function resetPassword(int $userResetId, int $userId): ?string
    {
        // Contrôle des données
        if (!$userResetId) {
            return null;
        }

        // Formatage des données mot de passe
        $newPassword = $this->generatePassword(15);
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);

        // Modification
        if (!$this->usersRepository->updatePassword($userResetId, $hash, $userId)) {
            return null;
        }

        return $newPassword;
    }

    /**
     * Modification d'un enregistrement
     */
    public function updatePassword(int $userId, UserInputDTO $data): ?bool
    {
        // Contrôle des données
        if (!$userId || !$this->isValidPasswordData($data)) {
            return null;
        }

        // Récupération de l'utilisateur pour vérifier le mot de passe
        $user = $this->usersRepository->getActiveUserDataById($userId);

        // Contrôle ancien mot de passe incorrect
        if (!$user || !password_verify($data->oldPassword, $user->password)) {
            return null;
        }

        // Formatage des données mot de passe
        $hash = password_hash($data->password, PASSWORD_DEFAULT);

        // Modification
        return $this->usersRepository->updatePassword($user->id, $hash, $userId);
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateUser(int $userId, UserInputDTO $data, int $userUpdateId): ?bool
    {
        // Contrôle des données
        if (!$userId || !$this->isValidUpdateUserData($data)) {
            return null;
        }

        // Récupération de l'utilisateur à modifier pour vérifier si c'est le dernier admin actif
        $currentUser = $this->usersRepository->getActiveUserDataById($userId);

        // Contrôle utilisateur récupéré
        if (!$currentUser) {
            return null;
        }

        // Contrôle dernier admin actif si changement de rôle
        if ($currentUser->level == EnumUserRole::SUPERADMIN->value && $data->level !== EnumUserRole::SUPERADMIN->value && $this->usersRepository->isLastAdmin()) {
            return false;
        }

        // Construction de l'objet
        $user = new User(
            id: $currentUser->id,
            level: $data->level,
            updatedBy: $userUpdateId
        );

        // Modification
        return $this->usersRepository->updateUser($user);
    }

    /**
     * Suppression logique d'un utilisateur
     */
    public function deleteUser(int $userDeleteId, int $userId): ?bool
    {
        // Contrôle des données
        if (!$userDeleteId || $userDeleteId == $userId) {
            return null;
        }

        // Récupération de l'utilisateur à supprimer pour vérifier si c'est le dernier admin actif
        $user = $this->usersRepository->getActiveUserDataById($userDeleteId);

        // Contrôle utilisateur récupéré
        if (!$user) {
            return null;
        }

        // Contrôle dernier admin actif si suppression
        if ($user && $user->level == EnumUserRole::SUPERADMIN->value && $this->usersRepository->isLastAdmin()) {
            return false;
        }

        // Suppression logique de l'utilisateur
        return $this->usersRepository->deleteUser($userDeleteId, $userId);
    }

    /**
     * Contrôle des données saisies (connexion)
     */
    private function isValidConnectionData(UserInputDTO $data): bool
    {
        $login = trim($data->login);
        $password = trim($data->password);

        return $login
            && $password;
    }

    /**
     * Contrôle des données saisies (création utilisateur)
     */
    private function isValidCreateUserData(UserInputDTO $data): bool
    {
        $login = trim($data->login);
        $password = trim($data->password);
        $confirmPassword = trim($data->confirmPassword);
        $level = $data->level;

        return $login
            && $password && $confirmPassword && $password === $confirmPassword
            && in_array($level, array_column(EnumUserRole::cases(), 'value'));
    }

    /**
     * Contrôle des données saisies (modification mot de passe)
     */
    private function isValidPasswordData(UserInputDTO $data): bool
    {
        $oldPassword = trim($data->oldPassword);
        $newPassword = trim($data->password);
        $confirmPassword = trim($data->confirmPassword);

        return $oldPassword && $newPassword && $confirmPassword
            && $oldPassword !== $newPassword
            && $newPassword === $confirmPassword;
    }

    /**
     * Contrôle des données saisies (modification utilisateur)
     */
    private function isValidUpdateUserData(UserInputDTO $data): bool
    {
        return in_array($data->level, array_column(EnumUserRole::cases(), 'value'));
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
