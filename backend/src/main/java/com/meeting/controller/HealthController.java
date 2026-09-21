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

    @org.springframework.beans.factory.annotation.Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private org.springframework.web.client.RestClient aiServiceRestClient;

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

    @GetMapping("/ai-connectivity")
    public ResponseEntity<Map<String, Object>> checkAiConnectivity() {
        Map<String, Object> response = new java.util.LinkedHashMap<>();
        String effectiveUrl = com.meeting.config.AiServiceConfig.resolveEffectiveAiUrl(aiServiceUrl);
        response.put("configured_ai_service_url", aiServiceUrl);
        response.put("effective_ai_service_url", effectiveUrl);
        if (aiServiceRestClient == null) {
            response.put("status", "ERROR");
            response.put("message", "aiServiceRestClient bean not found");
            return ResponseEntity.status(500).body(response);
        }
        try {
            String aiHealth = aiServiceRestClient.get()
                    .uri("/api/health")
                    .retrieve()
                    .body(String.class);
            response.put("status", "UP");
            response.put("ai_service_response", aiHealth);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "DOWN");
            response.put("error_type", e.getClass().getName());
            response.put("error_message", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.meeting.repository.UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.meeting.repository.MeetingRepository meetingRepository;

    @GetMapping("/db-diagnostic")
    public ResponseEntity<Map<String, Object>> checkDbDiagnostic() {
        Map<String, Object> response = new java.util.LinkedHashMap<>();
        java.util.List<String> tables = new java.util.ArrayList<>();
        if (dataSource != null) {
            try (java.sql.Connection conn = dataSource.getConnection()) {
                java.sql.DatabaseMetaData meta = conn.getMetaData();
                try (java.sql.ResultSet rs = meta.getTables(null, "public", "%", new String[]{"TABLE"})) {
                    while (rs.next()) {
                        tables.add(rs.getString("TABLE_NAME"));
                    }
                }
                response.put("tables", tables);
                response.put("db_product", meta.getDatabaseProductName() + " " + meta.getDatabaseProductVersion());
            } catch (Exception e) {
                response.put("metadata_error", e.getClass().getName() + ": " + e.getMessage());
            }
        } else {
            response.put("dataSource", "null");
        }

        if (userRepository != null) {
            try {
                long userCount = userRepository.count();
                response.put("user_count", userCount);
            } catch (Exception e) {
                response.put("user_repository_error", e.getClass().getName() + ": " + e.getMessage());
            }
        }

        if (meetingRepository != null) {
            try {
                long meetingCount = meetingRepository.count();
                response.put("meeting_count", meetingCount);
            } catch (Exception e) {
                response.put("meeting_repository_error", e.getClass().getName() + ": " + e.getMessage());
            }
        }

        return ResponseEntity.ok(response);
    }
}
