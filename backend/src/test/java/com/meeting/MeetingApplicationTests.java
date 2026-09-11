package com.meeting;

import com.meeting.controller.HealthController;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class MeetingApplicationTests {

    @Test
    void contextLoads() {
    }

    @Test
    void testHealthEndpoint() {
        HealthController healthController = new HealthController();
        ResponseEntity<Map<String, String>> response = healthController.checkHealth();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("UP", response.getBody().get("status"));
        assertEquals("AI Meeting Summarizer Backend", response.getBody().get("service"));
    }
}
