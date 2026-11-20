-- One row per in-app notification, always belonging to exactly one user.
-- Created as a side effect of other actions (see NotificationService.notify,
-- called from Policy/Claim/Payment services) rather than directly by users.
CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(20)  NOT NULL, -- payment | claim | policy | system
    title      VARCHAR(150) NOT NULL,
    message    VARCHAR(500) NOT NULL,
    icon       VARCHAR(30)  NOT NULL, -- matches a lucide-react icon name the frontend maps directly
    read       BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, read);
