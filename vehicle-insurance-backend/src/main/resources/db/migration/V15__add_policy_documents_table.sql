-- Backs Policy.documents (@ElementCollection, ordered) — supporting documents
-- (RC, PUC, previous policy) uploaded during policy creation. Same pattern as
-- claim_documents/claim_photos.
CREATE TABLE policy_documents (
    policy_id     UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    position      INTEGER NOT NULL,
    document_url  VARCHAR(500) NOT NULL,
    PRIMARY KEY (policy_id, position)
);
