-- Real Claim entity/migration, added early (out of module order) purely to
-- unblock compilation: ClaimDamagePoint.java already existed as a real JPA
-- entity referencing Claim, and Hibernate's ddl-auto=validate needs a
-- matching table for every @Entity on the classpath. The Claim module's
-- actual service/repository logic still runs on DummyClaimStore for now.
CREATE TABLE claims (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_number       VARCHAR(50)  NOT NULL,
    policy_id          UUID NOT NULL REFERENCES policies(id) ON DELETE RESTRICT,
    accident_date      DATE NOT NULL,
    location           VARCHAR(255) NOT NULL,
    description        TEXT NOT NULL,
    status             VARCHAR(20)  NOT NULL DEFAULT 'Filed', -- Filed | Under Review | Approved | Rejected | Closed
    estimated_amount   INTEGER,
    actual_amount      INTEGER,
    filed_date         DATE NOT NULL,
    vehicle_make       VARCHAR(100) NOT NULL,
    vehicle_model      VARCHAR(100) NOT NULL,
    registration_no    VARCHAR(20)  NOT NULL,
    damage_eligibility VARCHAR(30), -- null until reviewed
    ai_confidence      INTEGER,     -- 0-100, null until assessed
    created_at         TIMESTAMP NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT uq_claims_claim_number UNIQUE (claim_number)
);

CREATE INDEX idx_claims_policy_id ON claims (policy_id);
CREATE INDEX idx_claims_claim_number ON claims (UPPER(claim_number));

CREATE TABLE claim_damage_points (
    id          BIGSERIAL PRIMARY KEY,
    claim_id    UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    area        VARCHAR(100) NOT NULL,
    severity    VARCHAR(20)  NOT NULL, -- Low | Medium | High | Critical
    description VARCHAR(500) NOT NULL
);

CREATE INDEX idx_claim_damage_points_claim_id ON claim_damage_points (claim_id);

-- Backs Claim.notes (@ElementCollection, ordered)
CREATE TABLE claim_notes (
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    note     TEXT NOT NULL,
    PRIMARY KEY (claim_id, position)
);

-- Backs Claim.photos (@ElementCollection, ordered)
CREATE TABLE claim_photos (
    claim_id  UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    position  INTEGER NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    PRIMARY KEY (claim_id, position)
);
