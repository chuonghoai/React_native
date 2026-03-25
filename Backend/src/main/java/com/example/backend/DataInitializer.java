package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "manggia098@gmail.com";

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .username("admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("Admin@123"))
                    .fullname("Admin")
                    .role("ADMIN")
                    .phone("")
                    .avatarUrl("")
                    .build();

            userRepository.save(admin);
            System.out.println("✅ Admin account seeded: " + adminEmail);
        } else {
            System.out.println("ℹ️ Admin account already exists: " + adminEmail);
        }
    }
}
