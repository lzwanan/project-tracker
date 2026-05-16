package com.project.tracker.filter;

import com.project.tracker.entity.Personnel;
import com.project.tracker.entity.PersonnelRole;
import com.project.tracker.mapper.PersonnelRoleMapper;
import com.project.tracker.service.AuthService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final AuthService authService;
    private final PersonnelRoleMapper personnelRoleMapper;
    private static final Long GUEST_ROLE_ID = 8L;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equals(request.getMethod())) return true;
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/captcha") || path.startsWith("/api/auth/logout")
                || path.startsWith("/api/system/backups/download")) {
            return true;
        }
        Personnel user = authService.autoLogin(request);
        if (user == null) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"请先登录\",\"data\":null}");
            return false;
        }
        boolean isGuest = personnelRoleMapper.exists(
                new LambdaQueryWrapper<PersonnelRole>()
                        .eq(PersonnelRole::getPersonnelId, user.getId())
                        .eq(PersonnelRole::getRoleId, GUEST_ROLE_ID));
        if (isGuest && !"GET".equals(request.getMethod())) {
            response.setStatus(403);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":403,\"message\":\"游客无此权限\",\"data\":null}");
            return false;
        }
        return true;
    }
}
