package com.insurance.vehicle.modules.user.repository;

import com.insurance.vehicle.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    // Case-insensitive lookup - logins/registrations shouldn't care about email casing
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
