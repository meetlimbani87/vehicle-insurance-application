-- Adds a NEW version number rather than editing an existing users migration
-- (V1 is long since applied on real databases). Backs the Profile page,
-- which previously had no address field and no persisted notification
-- preferences at all (both were fake local-only state on the frontend).
ALTER TABLE users
    ADD COLUMN address               VARCHAR(255),
    ADD COLUMN email_notifications   BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN sms_notifications     BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN in_app_notifications  BOOLEAN NOT NULL DEFAULT true;
