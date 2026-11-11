-- Table des récompenses : cadeaux attribués à un participant et points dépensés
--
-- Dépend de : users, players, gifts

CREATE TABLE IF NOT EXISTS rewards (
    id         INT        NOT NULL AUTO_INCREMENT,
    player_id  INT        NOT NULL,
    gift_id    INT        NOT NULL,
    points     INT        NOT NULL DEFAULT 0,
    created_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT        NOT NULL,
    updated_at DATETIME   NULL,
    updated_by INT        NULL,
    deleted_at DATETIME   NULL,
    deleted_by INT        NULL,
    is_active  TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    CONSTRAINT fk_rewards_player_id  FOREIGN KEY (player_id)  REFERENCES players (id),
    CONSTRAINT fk_rewards_gift_id    FOREIGN KEY (gift_id)    REFERENCES gifts (id),
    CONSTRAINT fk_rewards_created_by FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT fk_rewards_updated_by FOREIGN KEY (updated_by) REFERENCES users (id),
    CONSTRAINT fk_rewards_deleted_by FOREIGN KEY (deleted_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
