-- Immutable trail of "who did what". user_id is nullable + user_name is
-- snapshotted separately so a log entry still reads correctly even if the
-- user account is later renamed or removed.
CREATE TABLE audit_logs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name    VARCHAR(150) NOT NULL,
    action       VARCHAR(20)  NOT NULL, -- CREATE | UPDATE | APPROVE | REJECT | SUSPEND | CLOSE | PAYMENT | LOGIN | UPLOAD
    entity       VARCHAR(50)  NOT NULL, -- e.g. "Policy", "Claim", "User"
    entity_id    VARCHAR(100) NOT NULL,
    ip_address   VARCHAR(45),
    created_at   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity);
