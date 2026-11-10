-- Table des utilisateurs (comptes de connexion à l'application)
--
-- created_by, updated_by et deleted_by n'ont volontairement pas de clé étrangère vers users : le premier utilisateur doit pouvoir se référencer lui-même
--
-- Aucune dépendance, cette table doit être créée en premier

CREATE TABLE IF NOT EXISTS users (
    id               INT          NOT NULL AUTO_INCREMENT,
    login            VARCHAR(100) NOT NULL,
    password         VARCHAR(100) NOT NULL,
    token            CHAR(64)     NULL,
    token_expires_at DATETIME     NULL,
    level            INT          NOT NULL DEFAULT 0,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       INT          NOT NULL,
    updated_at       DATETIME     NULL,
    updated_by       INT          NULL,
    deleted_at       DATETIME     NULL,
    deleted_by       INT          NULL,
    is_active        TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_login (login),
    KEY idx_users_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
