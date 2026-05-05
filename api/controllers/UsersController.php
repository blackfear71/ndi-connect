<?php
// Imports
require_once 'core/functions/Auth.php';

require_once 'enums/EnumUserRole.php';

require_once 'models/dtos/UserInputDTO.php';

require_once 'services/UsersService.php';

class UsersController
{
    private const controllerName = 'UsersController';

    private PDO $db;
    private Auth $auth;
    private UsersService $service;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->auth = new Auth($db);
        $this->service = new UsersService($db);
    }

    /**
     * Contrôle authentification
     */
    public function checkAuth(?string $token, bool $initLoad = false): void
    {
        try {
            // Contrôle authentification
            $user = $this->service->checkAuth($token);

            if ($user) {
                // Succès
                ResponseHelper::success($user);
            } else {
                if ($initLoad) {
                    // On ne remonte pas d'erreur si pas connecté au lancement de l'application
                    ResponseHelper::success();
                } else {
                    // Échec de l'authentification
                    ResponseHelper::error(MessageHelper::ERR_INVALID_AUTH, [__FUNCTION__, self::controllerName]);
                }
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllUsers(string $token): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $this->auth->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Lecture de tous les enregistrements
            $users = $this->service->getAllUsers();

            if ($users !== null) {
                // Succès
                ResponseHelper::success($users);
            } else {
                // Échec de la lecture
                ResponseHelper::error(MessageHelper::ERR_USERS_NOT_FOUND, [__FUNCTION__, self::controllerName]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }

    /**
     * Connexion utilisateur
     */
    public function connect(array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = UserInputDTO::fromArray($data);

            // Connexion utilisateur
            $user = $this->service->connect($dataDTO);

            if ($user) {
                // Token de connexion
                setcookie(
                    'token',
                    $user->token,
                    [
                        'expires' => time() + 3600 * 24, // 1 jour (identique à la durée stockée en base)
                        'path' => '/',
                        'secure' => true,
                        'httponly' => true,
                        'samesite' => 'Strict'
                    ]
                );

                // Succès
                ResponseHelper::success($user, MessageHelper::MSG_LOGIN_SUCCESS);
            } else {
                // Échec de la connexion
                ResponseHelper::error(MessageHelper::ERR_LOGIN_FAILED, [__FUNCTION__, self::controllerName, $dataDTO->login]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }

    /**
     * Déconnexion utilisateur
     */
    public function disconnect(string $token): void
    {
        try {
            // Contrôle authentification
            $user = $this->service->checkAuth($token);

            if ($user) {
                // Déconnexion utilisateur
                $disconnected = $this->service->disconnect($user->id);

                if ($disconnected) {
                    // Suppression token de connexion
                    setcookie(
                        'token',
                        '',
                        [
                            'expires' => time() - 3600,
                            'path' => '/',
                            'secure' => true,
                            'httponly' => true,
                            'samesite' => 'Strict'
                        ]
                    );

                    // Succès
                    ResponseHelper::success(null, MessageHelper::MSG_LOGOUT_SUCCESS);
                } else {
                    // Échec de la déconnexion
                    ResponseHelper::error(MessageHelper::ERR_LOGOUT_FAILED, [__FUNCTION__, self::controllerName, $user->id]);
                }
            } else {
                // Utilisateur non trouvé
                ResponseHelper::error(MessageHelper::ERR_UNAUTHORIZED_ACTION, [__FUNCTION__, self::controllerName]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createUser(string $token, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = UserInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Insertion d'un enregistrement
            $created = $this->service->createUser($dataDTO, $user->login);

            if ($created === true) {
                // Succès
                ResponseHelper::success(null, MessageHelper::MSG_CREATION_SUCCESS);
            } elseif ($created === false) {
                // Alerte
                ResponseHelper::warning(MessageHelper::WRN_USER_EXISTS, [$dataDTO->login]);
            } else {
                // Échec de la création
                ResponseHelper::error(MessageHelper::ERR_CREATION_FAILED, [__FUNCTION__, self::controllerName, json_encode($data)]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function resetPassword(string $token, int $idUser): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Modification d'un enregistrement
            $newPassword = $this->service->resetPassword($idUser, $user->login);

            if ($newPassword) {
                // Succès
                ResponseHelper::info($newPassword, MessageHelper::MSG_RESET_PASSWORD_SUCCESS);
            } else {
                // Échec de la création
                ResponseHelper::error(MessageHelper::ERR_RESET_PASSWORD_FAILED, [__FUNCTION__, self::controllerName, $idUser]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updatePassword(string $token, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = UserInputDTO::fromArray($data);

            // Contrôle authentification
            $user = $this->service->checkAuth($token);

            if ($user) {
                // Modification d'un enregistrement
                $updated = $this->service->updatePassword($user->id, $dataDTO, $user->login);

                if ($updated) {
                    // Succès
                    ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
                } else {
                    // Échec de la modification
                    ResponseHelper::error(MessageHelper::ERR_UPDATE_PASSWORD_FAILED, [__FUNCTION__, self::controllerName, $user->id]);
                }
            } else {
                // Utilisateur non trouvé
                ResponseHelper::error(MessageHelper::ERR_UNAUTHORIZED_ACTION, [__FUNCTION__, self::controllerName]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateUser(string $token, int $idUser, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = UserInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Suppression logique d'un enregistrement
            $updated = $this->service->updateUser($idUser, $dataDTO, $user->login);

            if ($updated === true) {
                // Succès
                ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
            } elseif ($updated === false) {
                // Alerte
                ResponseHelper::warning(MessageHelper::WRN_LAST_ADMIN);
            } else {
                // Échec de la modification
                ResponseHelper::error(MessageHelper::ERR_UPDATE_FAILED, [__FUNCTION__, self::controllerName, $idUser, json_encode($data)]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteUser(string $token, int $idUser): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Suppression logique d'un enregistrement
            $deleted = $this->service->deleteUser($idUser, $user->login);

            if ($deleted === true) {
                // Succès
                ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
            } elseif ($deleted === false) {
                // Alerte
                ResponseHelper::warning(MessageHelper::WRN_LAST_ADMIN);
            } else {
                // Échec de la suppression
                ResponseHelper::error(MessageHelper::ERR_DELETION_FAILED, [__FUNCTION__, self::controllerName, $idUser]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }
}
