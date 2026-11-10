-- Table des cadeaux d'une édition (valeur en points et quantité disponible)
--
-- Dépend de : users, editions

CREATE TABLE IF NOT EXISTS gifts (
    id         INT          NOT NULL AUTO_INCREMENT,
    edition_id INT          NOT NULL,
    name       VARCHAR(100) NOT NULL,
    value      INT          NOT NULL DEFAULT 0,
    quantity   INT          NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT          NOT NULL,
    updated_at DATETIME     NULL,
    updated_by INT          NULL,
    deleted_at DATETIME     NULL,
    deleted_by INT          NULL,
    is_active  TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    CONSTRAINT fk_gifts_edition_id FOREIGN KEY (edition_id) REFERENCES editions (id),
    CONSTRAINT fk_gifts_created_by FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT fk_gifts_updated_by FOREIGN KEY (updated_by) REFERENCES users (id),
    CONSTRAINT fk_gifts_deleted_by FOREIGN KEY (deleted_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
