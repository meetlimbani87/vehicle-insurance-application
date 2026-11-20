-- Added after V13 (rather than folded into V6) because V1-V13 had already
-- been applied to real databases by the time the Claim module's supporting-
-- documents step was built — editing an already-applied migration breaks
-- Flyway's checksum validation, so new claim schema needs go in new files
-- from here on.
--
-- Backs Claim.documents (@ElementCollection, ordered) — same pattern as
-- claim_photos, just for supporting documents (FIR, driving license, etc.)
-- instead of damage photos.
CREATE TABLE claim_documents (
    claim_id      UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    position      INTEGER NOT NULL,
    document_url  VARCHAR(500) NOT NULL,
    PRIMARY KEY (claim_id, position)
);
