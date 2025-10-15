<?php
require_once 'core/functions/Auth.php';

require_once 'enums/UserRole.php';

require_once 'services/UsersService.php';

class UsersController
{
    private const controllerName = 'UsersController';

    private $db;
    private $auth;
    private $service;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->db = $db;
        $this->auth = new Auth($db);
        $this->service = new UsersService($db);
    }

    /**
     * Contrôle authentification
     */
    public function checkAuth($token)
    {
        try {
            // Contrôle authentification
            $user = $this->service->checkAuth($token);

            if ($user) {
                // Succès
                ResponseHelper::success($user);
            } else {
                // Échec de l'authentification
                ResponseHelper::error(
                    'ERR_INVALID_AUTH',
                    401,
                    'Authentification incorrecte dans ' . __FUNCTION__ . ' de ' . self::controllerName
                );
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllUsers($token)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $this->auth->checkAuthAndLevel($token, UserRole::SUPERADMIN->value, __FUNCTION__, self::controllerName);

            // Lecture de tous les enregistrements
            $users = $this->service->getAllUsers();

            if ($users !== null) {
                // Succès
                ResponseHelper::success($users);
            } else {
                // Échec de la lecture
                ResponseHelper::error(
                    'ERR_USERS_NOT_FOUND',
                    400,
                    'Erreur lors de la récupération des utilisateurs dans ' . __FUNCTION__ . ' de ' . self::controllerName
                );
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Connexion utilisateur
     */
    public function connect($data)
    {
        try {
            // Connexion utilisateur
            $user = $this->service->connect($data);

            if ($user) {
                // Token de connexion
                setcookie(
                    'token',
                    $user['token'],
                    [
                        'expires' => time() + 3600 * 24, // 1 jour (identique à la durée stockée en base)
                        'path' => '/',
                        'secure' => true,
                        'httponly' => true,
                        'samesite' => 'Strict'
                    ]
                );

                // Suppression du token pour ne pas le renvoyer dans la réponse
                unset($user['token']);

                // Succès
                ResponseHelper::success($user);
            } else {
                // Échec de la connexion
                ResponseHelper::error(
                    'ERR_LOGIN_FAILED',
                    401,
                    'Utilisateur non trouvé dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour le login : ' . $data['login']
                );
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Déconnexion utilisateur
     */
    public function disconnect($token)
    {
        try {
            // Contrôle authentification
            $user = $this->service->checkAuth($token);

            if ($user) {
                // Déconnexion utilisateur
                $disconnected = $this->service->disconnect($user['login']);

                if ($disconnected) {
                    // Suppression token de connexion
                    setcookie('token', '', time() - 3600, '/');

                    // Succès
                    ResponseHelper::success(['disconnected' => $disconnected]);
                } else {
                    // Échec de la déconnexion
                    ResponseHelper::error(
                        'ERR_LOGOUT_FAILED',
                        401,
                        'Erreur lors de la déconnexion dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour le login : ' . $user['login']
                    );
                }
            } else {
                // Utilisateur non trouvé
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    401,
                    'Utilisateur non trouvé dans ' . __FUNCTION__ . ' de ' . self::controllerName
                );
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createUser($token, $data)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, UserRole::SUPERADMIN->value, __FUNCTION__, self::controllerName);

            // Insertion d'un enregistrement
            $created = $this->service->createUser($user['login'], $data);

            if ($created === true) {
                // Succès
                ResponseHelper::success(null, 'MSG_CREATION_SUCCESS');
            } else if ($created === false) {
                // Alerte
                ResponseHelper::warning(null, 'MSG_USER_EXISTS', 409);
            } else {
                // Échec de la création
                ResponseHelper::error(
                    'ERR_CREATION_FAILED',
                    400,
                    'Erreur lors de la création de l\'utilisateur dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour le login : ' . $data['login'] . ' (utilisateur niveau ' . $data['level'] . ')'
                );
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function resetPassword($token, $id)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, UserRole::SUPERADMIN->value, __FUNCTION__, self::controllerName);

            // Modification d'un enregistrement
            $newPassword = $this->service->resetPassword($user['login'], $id);

            if ($newPassword) {
                // Succès
                ResponseHelper::info($newPassword, 'MSG_RESET_PASSWORD_SUCCESS');
            } else {
                // Échec de la création
                ResponseHelper::error(
                    'ERR_CREATION_FAILED',
                    400,
                    'Erreur lors de la réinitialisation du mot de passe dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour l\'id : ' . $id
                );
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updatePassword($token, $data)
    {
        try {
            // Contrôle authentification
            $user = $this->service->checkAuth($token);

            if ($user) {
                // Modification d'un enregistrement
                $updated = $this->service->updatePassword($user['login'], $data);

                if ($updated) {
                    // Succès
                    ResponseHelper::success(null, 'MSG_UPDATE_SUCCESS');
                } else {
                    // Échec de la modification
                    ResponseHelper::error(
                        'ERR_UPDATE_FAILED',
                        400,
                        'Erreur lors de la modification du mot de passe dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour le login : ' . $user['login']
                    );
                }
            } else {
                // Utilisateur non trouvé
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    401,
                    'Utilisateur non trouvé dans ' . __FUNCTION__ . ' de ' . self::controllerName
                );
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateUser($token, $data)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, UserRole::SUPERADMIN->value, __FUNCTION__, self::controllerName);

            // Suppression logique d'un enregistrement
            $users = $this->service->updateUser($user['login'], $data);

            if ($users !== null) {
                // Succès
                ResponseHelper::success($users, 'MSG_UPDATE_SUCCESS');
            } else {
                // Échec de la modification
                ResponseHelper::error(
                    'ERR_UPDATE_FAILED',
                    400,
                    'Erreur lors de la modification de l\'utilisateur dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour l\'id : ' . $data['id']
                );
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteUser($token, $id)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, UserRole::SUPERADMIN->value, __FUNCTION__, self::controllerName);

            // Suppression logique d'un enregistrement
            $users = $this->service->deleteUser($id, $user['login']);

            if ($users !== null) {
                // Succès
                ResponseHelper::success($users, 'MSG_DELETION_SUCCESS');
            } else {
                // Échec de la suppression
                ResponseHelper::error(
                    'ERR_DELETION_FAILED',
                    400,
                    'Erreur lors de la suppression de l\'utilisateur dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour l\'id : ' . $id
                );
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }
}
