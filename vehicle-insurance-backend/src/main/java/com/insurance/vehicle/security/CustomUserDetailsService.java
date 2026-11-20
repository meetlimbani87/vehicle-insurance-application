package com.insurance.vehicle.security;

import com.insurance.vehicle.modules.user.entity.User;
import com.insurance.vehicle.modules.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public CustomUserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("No user with email: " + email));

        // Re-checked on every request (not just at login) so a suspension takes
        // effect immediately, even for a JWT issued before the account was suspended.
        // JwtAuthenticationFilter catches this and treats the request as anonymous,
        // which then gets rejected by the normal 401 path on any locked-down endpoint.
        if ("SUSPENDED".equalsIgnoreCase(user.getStatus())) {
            throw new UsernameNotFoundException("This account has been suspended");
        }

        return new CustomUserDetails(user);
    }
}
