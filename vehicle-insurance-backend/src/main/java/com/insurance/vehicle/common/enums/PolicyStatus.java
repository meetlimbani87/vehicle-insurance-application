package com.insurance.vehicle.common.enums;

/**
 * Internal representation of a policy's lifecycle state. Stored uppercase in
 * the DB (see chk_policies_status); PolicyMapper converts it to the
 * Title-Case string the frontend's Policy["status"] union expects
 * ("Active", "Expired", etc.) so the two only need to agree on meaning, not casing.
 */
public enum PolicyStatus {
    ACTIVE,
    EXPIRED,
    RENEWED,
    CANCELLED,
    PENDING;

    // "ACTIVE" -> "Active" - matches the exact casing the frontend Policy type expects
    public String toDisplayValue() {
        String lower = name().toLowerCase();
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }
}
