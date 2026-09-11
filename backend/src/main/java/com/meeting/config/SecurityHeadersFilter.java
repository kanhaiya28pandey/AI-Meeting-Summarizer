package com.meeting.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Filter that attaches security headers, cache controls, and request correlation IDs.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityHeadersFilter implements Filter {

    public static final String REQUEST_ID_HEADER = "X-Request-ID";
    public static final String MDC_REQUEST_ID_KEY = "requestId";
    private static final Pattern SAFE_REQUEST_ID = Pattern.compile("^[a-zA-Z0-9_-]{1,64}$");

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (request instanceof HttpServletRequest httpRequest && response instanceof HttpServletResponse httpResponse) {
            // 1. Correlation ID Resolution
            String clientRequestId = httpRequest.getHeader(REQUEST_ID_HEADER);
            String effectiveRequestId;
            if (clientRequestId != null && SAFE_REQUEST_ID.matcher(clientRequestId.trim()).matches()) {
                effectiveRequestId = clientRequestId.trim();
            } else {
                effectiveRequestId = UUID.randomUUID().toString();
            }

            MDC.put(MDC_REQUEST_ID_KEY, effectiveRequestId);
            httpResponse.setHeader(REQUEST_ID_HEADER, effectiveRequestId);

            // 2. Security Headers
            httpResponse.setHeader("X-Content-Type-Options", "nosniff");
            httpResponse.setHeader("X-Frame-Options", "DENY");
            httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

            // 3. Cache Control for sensitive meeting API endpoints
            String path = httpRequest.getRequestURI();
            if (path != null && path.startsWith("/api/meetings")) {
                httpResponse.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
                httpResponse.setHeader("Pragma", "no-cache");
            }

            try {
                chain.doFilter(request, response);
            } finally {
                MDC.remove(MDC_REQUEST_ID_KEY);
            }
        } else {
            chain.doFilter(request, response);
        }
    }
}
