package com.meeting.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
public class AiServiceConfig {

    private static final Logger log = LoggerFactory.getLogger(AiServiceConfig.class);

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    @Value("${ai.service.connect-timeout:60000}")
    private int connectTimeoutMillis;

    @Value("${ai.service.read-timeout:900000}")
    private int readTimeoutMillis;

    public static String resolveEffectiveAiUrl(String rawUrl) {
        String clean = rawUrl != null ? rawUrl.trim().replaceAll("/+$", "") : "";
        boolean isRender = System.getenv("RENDER") != null || System.getenv("RENDER_SERVICE_ID") != null;
        if (clean.isEmpty() || (isRender && (clean.contains("localhost") || clean.contains("127.0.0.1")))) {
            log.warn("Detected localhost or empty AI service URL in cloud environment. Auto-routing to production AI service: https://ai-meeting-summarizer-ai.onrender.com");
            return "https://ai-meeting-summarizer-ai.onrender.com";
        }
        return clean.isEmpty() ? "http://localhost:8000" : clean;
    }

    @Bean
    public RestClient aiServiceRestClient() {
        String effectiveUrl = resolveEffectiveAiUrl(aiServiceUrl);
        log.info("Configuring AI Service RestClient with effective baseUrl: {}", effectiveUrl);

        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(connectTimeoutMillis))
                .build();

        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofMillis(readTimeoutMillis));

        return RestClient.builder()
                .baseUrl(effectiveUrl)
                .requestFactory(requestFactory)
                .build();
    }
}
