package com.insurance.vehicle.modules.policy.repository;

import com.insurance.vehicle.modules.policy.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    // Used by PolicyServiceImpl to reuse an existing vehicle row on renewal
    // instead of creating a duplicate one for the same physical vehicle
    Optional<Vehicle> findByRegistrationNoIgnoreCase(String registrationNo);
}
