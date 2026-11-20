package com.insurance.vehicle.modules.policy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A registered vehicle. Deliberately kept separate from Policy so the same
 * physical vehicle can be looked up and reused across a renewal instead of
 * spawning a duplicate row every time (see PolicyServiceImpl.findOrCreateVehicle).
 * Maps to the `vehicles` table created in V3__create_vehicles_table.sql.
 */
@Entity
@Table(name = "vehicles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String make;

    @Column(nullable = false, length = 100)
    private String model;

    // Kept as a 4-digit String (not int) to match the frontend's vehicleYear field 1:1
    @Column(nullable = false, length = 4)
    private String year;

    @Column(name = "registration_no", nullable = false, unique = true, length = 20)
    private String registrationNo;

    // "two-wheeler" | "car" | "suv" | "commercial" - kept as a plain validated
    // String (not a Java enum) since the values are hyphenated and only ever
    // read/written verbatim to/from the frontend, same approach as User.status.
    @Column(name = "vehicle_type", nullable = false, length = 20)
    private String vehicleType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
