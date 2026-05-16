package com.project.tracker.filter;

import com.project.tracker.service.AuthService;
import com.project.tracker.entity.Personnel;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class AccessLogFilter implements Filter {

    private final JdbcTemplate jdbcTemplate;
    private final AuthService authService;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        String path = req.getRequestURI();

        if (path.startsWith("/api/") && !path.startsWith("/api/auth/")) {
            try {
                Personnel user = null;
                try { user = authService.autoLogin(req); } catch (Exception ignored) {}
                String username = user != null ? user.getName() : "游客";
                String ip = getClientIp(req);
                String method = req.getMethod();
                String ua = req.getHeader("User-Agent");
                if (ua != null && ua.length() > 450) ua = ua.substring(0, 450);
                jdbcTemplate.update(
                        "INSERT INTO access_log (username, ip, method, path, user_agent) VALUES (?,?,?,?,?)",
                        username, ip, method, path, ua);
            } catch (Exception e) {
                log.warn("AccessLog insert failed: {}", e.getMessage());
            }
        }
        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest req) {
        String ip = req.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) ip = req.getHeader("X-Real-IP");
        if (ip == null || ip.isEmpty()) ip = req.getRemoteAddr();
        return ip != null && ip.contains(",") ? ip.split(",")[0].trim() : ip;
    }
}
