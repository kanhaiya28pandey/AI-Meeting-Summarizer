package com.meeting.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private javax.sql.DataSource dataSource;

    public HealthController() {
    }

    public HealthController(javax.sql.DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "AI Meeting Summarizer Backend"
        ));
    }

    @GetMapping("/readiness")
    public ResponseEntity<Map<String, String>> checkReadiness() {
        boolean dbHealthy = false;
        if (dataSource != null) {
            try (java.sql.Connection conn = dataSource.getConnection()) {
                dbHealthy = conn.isValid(2);
            } catch (Exception ex) {
                dbHealthy = false;
            }
        }

        if (dbHealthy) {
            return ResponseEntity.ok(Map.of(
                    "status", "UP",
                    "database", "CONNECTED"
            ));
        } else {
            return ResponseEntity.status(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "status", "DOWN",
                    "database", "DISCONNECTED"
            ));
        }
    }
}
