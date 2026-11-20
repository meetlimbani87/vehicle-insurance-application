-- A vehicle is registered once and can be looked up again on renewal
-- (matched by registration_no) instead of creating a duplicate row every time.
CREATE TABLE vehicles (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make             VARCHAR(100) NOT NULL,
    model            VARCHAR(100) NOT NULL,
    year             VARCHAR(4)   NOT NULL,
    registration_no  VARCHAR(20)  NOT NULL,
    vehicle_type     VARCHAR(20)  NOT NULL, -- two-wheeler | car | suv | commercial
    created_at       TIMESTAMP NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT uq_vehicles_registration_no UNIQUE (registration_no),
    CONSTRAINT chk_vehicles_type CHECK (vehicle_type IN ('two-wheeler', 'car', 'suv', 'commercial'))
);

CREATE INDEX idx_vehicles_registration_no ON vehicles (UPPER(registration_no));
