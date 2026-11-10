-- Table des éditions (événements regroupant participants, cadeaux et cartes)
--
-- Dépend de : users

CREATE TABLE IF NOT EXISTS editions (
    id         INT          NOT NULL AUTO_INCREMENT,
    location   VARCHAR(100) NOT NULL,
    start_date DATETIME     NOT NULL,
    end_date   DATETIME     NOT NULL,
    picture    VARCHAR(255) NULL,
    theme      TEXT         NULL,
    challenge  TEXT         NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT          NOT NULL,
    updated_at DATETIME     NULL,
    updated_by INT          NULL,
    deleted_at DATETIME     NULL,
    deleted_by INT          NULL,
    is_active  TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    CONSTRAINT fk_editions_created_by FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT fk_editions_updated_by FOREIGN KEY (updated_by) REFERENCES users (id),
    CONSTRAINT fk_editions_deleted_by FOREIGN KEY (deleted_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
