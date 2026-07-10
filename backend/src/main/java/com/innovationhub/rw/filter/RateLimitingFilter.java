package com.innovationhub.rw.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(1)
public class RateLimitingFilter implements Filter {

    private final Map<String, Window> buckets = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_MS = 60_000;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        String path = req.getRequestURI();

        if (!path.startsWith("/api/auth/")) {
            chain.doFilter(request, response);
            return;
        }

        String ip = req.getRemoteAddr();
        long now = System.currentTimeMillis();
        Window w = buckets.compute(ip, (k, v) -> {
            if (v == null || now - v.start > WINDOW_MS) {
                return new Window(now, new AtomicInteger(1));
            }
            v.count.incrementAndGet();
            return v;
        });

        if (w.count.get() > MAX_REQUESTS) {
            ((HttpServletResponse) response).setStatus(429);
            response.getWriter().write("{\"error\":\"Too many requests. Try again in 60 seconds.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private record Window(long start, AtomicInteger count) {}
}
