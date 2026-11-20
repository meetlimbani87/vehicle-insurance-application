-- New version number, not a reused one (see PROJECT_HANDOFF.md migrations rule).
-- Adds installment-interval metadata (how the policy owner chose to split
-- their premium) and reminder tracking (so the reminder scheduler never
-- sends the same "payment due" notification twice for one installment).
ALTER TABLE payment_schedules
    ADD COLUMN payment_interval VARCHAR(20) NOT NULL DEFAULT 'one-time', -- one-time | monthly | quarterly | half-yearly | annually
    ADD COLUMN reminder_sent    BOOLEAN NOT NULL DEFAULT false;
