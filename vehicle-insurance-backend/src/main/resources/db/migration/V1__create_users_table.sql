-- pgcrypto gives us gen_random_uuid() for UUID primary keys
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(150) NOT NULL,
    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    phone          VARCHAR(20)  NOT NULL,
    role           VARCHAR(20)  NOT NULL DEFAULT 'USER',   -- USER | ADMIN
    status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | SUSPENDED
    created_at     TIMESTAMP NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_role CHECK (role IN ('USER', 'ADMIN')),
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'SUSPENDED'))
);

CREATE INDEX idx_users_email ON users (LOWER(email));

-- Seed admin account so admin login keeps working after moving off the dummy store.
-- Login: admin@vehicle.com / admin123  (bcrypt hash below is that password)
INSERT INTO users (name, email, password_hash, phone, role, status)
VALUES (
    'System Admin',
    'admin@vehicle.com',
    '$2b$10$vPkxF9kQc3ZM9eTzu4VC7unlmD4/VdPlH0vwz3eKrYMfdmnFyiffK',
    '9999999999',
    'ADMIN',
    'ACTIVE'
);
