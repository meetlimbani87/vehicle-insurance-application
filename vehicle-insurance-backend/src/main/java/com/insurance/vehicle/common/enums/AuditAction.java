package com.insurance.vehicle.common.enums;

/**
 * The set of actions the audit trail can record. Names match the frontend's
 * AuditLogsPage.tsx actionColors keys exactly, so a logged action already
 * renders with the right badge color without any translation layer.
 */
public enum AuditAction {
    CREATE,
    UPDATE,
    APPROVE,
    REJECT,
    SUSPEND,
    CLOSE,
    PAYMENT,
    LOGIN,
    UPLOAD
}
