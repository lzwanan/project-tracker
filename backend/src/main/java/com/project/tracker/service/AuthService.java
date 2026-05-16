package com.project.tracker.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.project.tracker.dto.LoginRequest;
import com.project.tracker.dto.LoginResponse;
import com.project.tracker.entity.Personnel;
import com.project.tracker.mapper.PersonnelMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PersonnelMapper personnelMapper;
    private final PasswordUtil passwordUtil;

    public LoginResponse login(LoginRequest request, HttpSession session) {
        Personnel personnel = personnelMapper.selectOne(
                new LambdaQueryWrapper<Personnel>()
                        .eq(Personnel::getEmployeeId, request.getEmployeeId())
        );
        if (personnel == null || !passwordUtil.verify(request.getPassword(), personnel.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        session.setAttribute("user", personnel);
        LoginResponse response = new LoginResponse();
        response.setUser(personnel);
        response.setFirstLogin(personnel.getFirstLogin() != null && personnel.getFirstLogin());
        String token = createRememberToken(personnel.getId());
        response.setToken(token);
        return response;
    }

    public String createRememberToken(Long personnelId) {
        String token = UUID.randomUUID().toString();
        Personnel personnel = personnelMapper.selectById(personnelId);
        if (personnel != null) {
            personnel.setRememberToken(token);
            personnelMapper.updateById(personnel);
        }
        return token;
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }

    public Personnel autoLogin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("user") != null) {
            return (Personnel) session.getAttribute("user");
        }
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("REMEMBER_TOKEN".equals(cookie.getName())) {
                    String token = cookie.getValue();
                    Personnel personnel = personnelMapper.selectOne(
                            new LambdaQueryWrapper<Personnel>()
                                    .eq(Personnel::getRememberToken, token)
                    );
                    if (personnel != null) {
                        request.getSession().setAttribute("user", personnel);
                        return personnel;
                    }
                }
            }
        }
        return null;
    }

    public void changePassword(Long personnelId, String oldPassword, String newPassword) {
        Personnel personnel = personnelMapper.selectById(personnelId);
        if (personnel == null || !passwordUtil.verify(oldPassword, personnel.getPassword())) {
            throw new RuntimeException("Invalid old password");
        }
        personnel.setPassword(passwordUtil.hash(newPassword));
        personnel.setFirstLogin(false);
        personnelMapper.updateById(personnel);
    }

    public void resetPassword(Long personnelId, String newPassword) {
        Personnel personnel = personnelMapper.selectById(personnelId);
        if (personnel == null) {
            throw new RuntimeException("Personnel not found");
        }
        personnel.setPassword(passwordUtil.hash(newPassword));
        personnel.setFirstLogin(true);
        personnelMapper.updateById(personnel);
    }
}
