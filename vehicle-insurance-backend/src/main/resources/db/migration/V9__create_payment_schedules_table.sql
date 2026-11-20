-- One row per premium installment. For now, exactly one row is generated per
-- policy at creation time (the first premium, paid immediately — no
-- gateway exists yet, so "paying" just means the policy was activated).
-- Renewals will add future installments once the renewal feature exists.
-- "Overdue" is NOT stored here — it's derived at read time (Pending + past
-- due date) rather than needing a scheduled job to flip statuses.
CREATE TABLE payment_schedules (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id          UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount             INTEGER NOT NULL,
    due_date           DATE NOT NULL,
    status             VARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending | Paid (Overdue is derived)
    paid_date          DATE,
    receipt_no         VARCHAR(50),
    created_at         TIMESTAMP NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT uq_payment_schedules_receipt_no UNIQUE (receipt_no)
);

CREATE INDEX idx_payment_schedules_policy_id ON payment_schedules (policy_id);
