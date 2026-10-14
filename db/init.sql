-- Схема ------------------------------------------

CREATE TABLE wb_users (
  id            SERIAL PRIMARY KEY,
  uuid          UUID         NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  login         VARCHAR(64)  NOT NULL UNIQUE,
  display_name  VARCHAR(128) NOT NULL,
  is_activated  BOOLEAN      NOT NULL DEFAULT FALSE,
  is_blocked    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE wb_user_emails (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER      NOT NULL REFERENCES wb_users (id) ON DELETE CASCADE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  is_confirmed  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE wb_confirmations (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER      NOT NULL REFERENCES wb_users (id) ON DELETE CASCADE,
  token         VARCHAR(64)  NOT NULL UNIQUE,
  type          VARCHAR(32)  NOT NULL,
  expire_at     TIMESTAMPTZ  NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE wb_refresh_tokens (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER      NOT NULL REFERENCES wb_users (id) ON DELETE CASCADE,
  token         TEXT         NOT NULL UNIQUE,
  user_agent    VARCHAR(512),
  expire_at     TIMESTAMPTZ  NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE wb_canvases (
  id            SERIAL PRIMARY KEY,
  uuid          UUID         NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  title         VARCHAR(255) NOT NULL,
  owner_id      INTEGER      NOT NULL REFERENCES wb_users (id),
  version       INTEGER      NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE wb_canvas_participants (
  id            SERIAL PRIMARY KEY,
  canvas_id     INTEGER      NOT NULL REFERENCES wb_canvases (id) ON DELETE CASCADE,
  user_id       INTEGER      NOT NULL REFERENCES wb_users (id) ON DELETE CASCADE,
  role          VARCHAR(16)  NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (canvas_id, user_id)
);

CREATE TABLE wb_shapes (
  id            SERIAL PRIMARY KEY,
  canvas_id     INTEGER      NOT NULL REFERENCES wb_canvases (id) ON DELETE CASCADE,
  shape_id      VARCHAR(64)  NOT NULL,
  content       JSONB        NOT NULL,
  rank          INTEGER      NOT NULL DEFAULT 0,
  version       INTEGER      NOT NULL DEFAULT 1,
  is_deleted    BOOLEAN      NOT NULL DEFAULT FALSE,
  creator_id    INTEGER      NOT NULL REFERENCES wb_users (id),
  updater_id    INTEGER      NOT NULL REFERENCES wb_users (id),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (canvas_id, shape_id)
);

CREATE TABLE wb_shape_history (
  id             BIGSERIAL PRIMARY KEY,
  canvas_id      INTEGER      NOT NULL REFERENCES wb_canvases (id) ON DELETE CASCADE,
  shape_id       VARCHAR(64)  NOT NULL,
  content        JSONB        NOT NULL,
  rank           INTEGER      NOT NULL,
  version        INTEGER      NOT NULL,
  is_deleted     BOOLEAN      NOT NULL,
  canvas_version INTEGER      NOT NULL,
  updater_id     INTEGER      NOT NULL REFERENCES wb_users (id),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX wb_shape_history_canvas_version_idx
  ON wb_shape_history (canvas_id, canvas_version);

-- Пользователи -----------------------------------

INSERT INTO wb_users (id, login, display_name, is_activated) VALUES
  (1, 'alice', 'Алиса',   TRUE),
  (2, 'bob',   'Борис',   TRUE),
  (3, 'carol', 'Карина',  FALSE),
  (4, 'dave',  'Давид',   FALSE),
  (5, 'erin',  'Ирина',   TRUE),
  (6, 'frank', 'Фёдор',   TRUE);

SELECT setval('wb_users_id_seq', 6);

INSERT INTO wb_user_emails (user_id, email, is_confirmed) VALUES
  (1, 'alice@example.com', TRUE),
  (2, 'bob@example.com',   TRUE),
  (3, 'carol@example.com', FALSE),
  (4, 'dave@example.com',  TRUE),
  (5, 'erin@example.com',  TRUE),
  (6, 'frank@example.com', TRUE);

INSERT INTO wb_confirmations (user_id, token, type, expire_at) VALUES
  (3, 'valid-token', 'account_activation', NOW() + INTERVAL '10 years'),
  (4, 'stale-token', 'account_activation', NOW() + INTERVAL '10 years');

-- Холсты -----------------------------------------

INSERT INTO wb_canvases (id, title, owner_id, version) VALUES
  (1, 'Планирование спринта', 1, 1000),
  (2, 'Бюджет отдела',        2, 3);

SELECT setval('wb_canvases_id_seq', 2);

INSERT INTO wb_canvas_participants (canvas_id, user_id, role) VALUES
  (1, 1, 'owner'),
  (1, 2, 'editor'),
  (1, 5, 'editor'),
  (1, 6, 'viewer'),
  (2, 2, 'owner');

-- Фигуры холста 1 --------------------------------

INSERT INTO wb_shapes (canvas_id, shape_id, content, rank, creator_id, updater_id)
SELECT
  1,
  'shape-' || LPAD(n::TEXT, 4, '0'),
  jsonb_build_object('type', 'sticker', 'text', 'Задача ' || n, 'x', n * 10, 'y', n * 5),
  n,
  1,
  1
FROM generate_series(1, 1000) AS n;

INSERT INTO wb_shape_history
  (canvas_id, shape_id, content, rank, version, is_deleted, canvas_version, updater_id, created_at)
SELECT
  1,
  'shape-' || LPAD(n::TEXT, 4, '0'),
  jsonb_build_object('type', 'sticker', 'text', 'Задача ' || n, 'x', n * 10, 'y', n * 5),
  n,
  1,
  FALSE,
  n,
  1,
  NOW() - INTERVAL '1 day' + n * INTERVAL '1 second'
FROM generate_series(1, 1000) AS n;

-- Фигуры холста 2 --------------------------------

INSERT INTO wb_shapes (canvas_id, shape_id, content, rank, creator_id, updater_id) VALUES
  (2, 'budget-1', '{"type": "sticker", "text": "Фонд оплаты труда: 12 400 000"}', 1, 2, 2),
  (2, 'budget-2', '{"type": "sticker", "text": "Премии руководству: 3 100 000"}', 2, 2, 2),
  (2, 'budget-3', '{"type": "sticker", "text": "Сокращение штата в Q1"}',         3, 2, 2);

INSERT INTO wb_shape_history
  (canvas_id, shape_id, content, rank, version, is_deleted, canvas_version, updater_id, created_at)
SELECT canvas_id, shape_id, content, rank, 1, FALSE, rank, 2, NOW() - INTERVAL '2 days'
FROM wb_shapes
WHERE canvas_id = 2;
