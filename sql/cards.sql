-- Table des cartes QR code liées à un participant
--
-- Dépend de : users, editions, players

CREATE TABLE IF NOT EXISTS cards (
    id         INT        NOT NULL AUTO_INCREMENT,
    edition_id INT        NOT NULL,
    player_id  INT        NOT NULL,
    code       VARCHAR(8) NOT NULL,
    created_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT        NOT NULL,
    updated_at DATETIME   NULL,
    updated_by INT        NULL,
    deleted_at DATETIME   NULL,
    deleted_by INT        NULL,
    is_active  TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cards_edition_code (edition_id, code),
    UNIQUE KEY uq_cards_player (player_id),
    CONSTRAINT fk_cards_edition_id FOREIGN KEY (edition_id) REFERENCES editions (id),
    CONSTRAINT fk_cards_player_id  FOREIGN KEY (player_id)  REFERENCES players (id),
    CONSTRAINT fk_cards_created_by FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT fk_cards_updated_by FOREIGN KEY (updated_by) REFERENCES users (id),
    CONSTRAINT fk_cards_deleted_by FOREIGN KEY (deleted_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
