-- A policy belongs to exactly one user (owner) and references one vehicle.
-- premium_amount is stored pre-calculated at creation time (see
-- PremiumCalculatorService) rather than recomputed on every read.
CREATE TABLE policies (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id          UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    policy_number       VARCHAR(50)  NOT NULL,
    insurance_company   VARCHAR(150) NOT NULL,
    coverage_type       VARCHAR(20)  NOT NULL, -- comprehensive | third-party | own-damage
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | EXPIRED | RENEWED | CANCELLED | PENDING
    premium_amount      INTEGER NOT NULL DEFAULT 0,
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT uq_policies_policy_number UNIQUE (policy_number),
    CONSTRAINT chk_policies_coverage_type CHECK (coverage_type IN ('comprehensive', 'third-party', 'own-damage')),
    CONSTRAINT chk_policies_status CHECK (status IN ('ACTIVE', 'EXPIRED', 'RENEWED', 'CANCELLED', 'PENDING')),
    CONSTRAINT chk_policies_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_policies_user_id ON policies (user_id);
CREATE INDEX idx_policies_vehicle_id ON policies (vehicle_id);
CREATE INDEX idx_policies_policy_number ON policies (UPPER(policy_number));
