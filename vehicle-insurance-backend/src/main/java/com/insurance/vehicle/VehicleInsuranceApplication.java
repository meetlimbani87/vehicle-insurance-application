package com.insurance.vehicle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VehicleInsuranceApplication {
    // Boots the embedded Tomcat server and starts the whole Spring app
    public static void main(String[] args) {
        SpringApplication.run(VehicleInsuranceApplication.class, args);
    }
}
