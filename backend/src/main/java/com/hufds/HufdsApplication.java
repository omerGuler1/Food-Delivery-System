package com.hufds;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HufdsApplication {
    public static void main(String[] args) {
        SpringApplication.run(HufdsApplication.class, args);
    }
} 