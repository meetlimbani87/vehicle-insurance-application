-- One row per status change (or milestone note) on a claim, oldest first.
-- Powers the claim's real history/audit trail (separate from the general
-- audit_logs table, which logs *who* did it; this logs *what happened to
-- this claim, in order* for the claimant/admin to see as a timeline).
CREATE TABLE claim_timeline_events (
    id         BIGSERIAL PRIMARY KEY,
    claim_id   UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    status     VARCHAR(30)  NOT NULL, -- the status the claim moved to at this point
    note       VARCHAR(500),          -- optional human-readable context
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_claim_timeline_events_claim_id ON claim_timeline_events (claim_id);
