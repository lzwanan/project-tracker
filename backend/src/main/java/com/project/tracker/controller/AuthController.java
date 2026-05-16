package com.project.tracker.controller;

import com.project.tracker.dto.LoginRequest;
import com.project.tracker.dto.LoginResponse;
import com.project.tracker.dto.R;
import com.project.tracker.entity.Personnel;
import com.project.tracker.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/captcha")
    public R<Map<String, String>> captcha(HttpSession session) throws IOException {
        int width = 120, height = 40;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, width, height);
        g.setFont(new Font("Arial", Font.BOLD, 24));
        String code = String.format("%04d", new Random().nextInt(10000));
        session.setAttribute("CAPTCHA_CODE", code);
        for (int i = 0; i < 4; i++) {
            g.setColor(new Color(new Random().nextInt(150), new Random().nextInt(150), new Random().nextInt(150)));
            g.drawString(String.valueOf(code.charAt(i)), 15 + i * 25, 30);
        }
        for (int i = 0; i < 5; i++) {
            g.setColor(new Color(new Random().nextInt(200), new Random().nextInt(200), new Random().nextInt(200)));
            g.drawLine(new Random().nextInt(width), new Random().nextInt(height),
                    new Random().nextInt(width), new Random().nextInt(height));
        }
        g.dispose();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "png", baos);
        String base64 = "data:image/png;base64," + Base64.getEncoder().encodeToString(baos.toByteArray());
        Map<String, String> result = new HashMap<>();
        result.put("image", base64);
        return R.ok(result);
    }

    @PostMapping("/login")
    public R<LoginResponse> login(@RequestBody Map<String, Object> body,
                                   HttpSession session,
                                   HttpServletResponse response) {
        String captcha = (String) body.get("captcha");
        String sessionCaptcha = (String) session.getAttribute("CAPTCHA_CODE");
        if (sessionCaptcha == null || !sessionCaptcha.equals(captcha)) {
            return R.fail("验证码错误");
        }
        session.removeAttribute("CAPTCHA_CODE");
        LoginRequest request = new LoginRequest();
        request.setEmployeeId((String) body.get("employeeId"));
        request.setPassword((String) body.get("password"));
        LoginResponse loginResponse = authService.login(request, session);
        boolean remember = "true".equals(String.valueOf(body.get("remember")));
        if (remember) {
            String token = authService.createRememberToken(loginResponse.getUser().getId());
            Cookie cookie = new Cookie("REMEMBER_TOKEN", token);
            cookie.setMaxAge(7 * 24 * 60 * 60);
            cookie.setPath("/");
            cookie.setHttpOnly(true);
            response.addCookie(cookie);
        }
        return R.ok(loginResponse);
    }

    @PostMapping("/logout")
    public R<Void> logout(HttpSession session) {
        authService.logout(session);
        return R.ok();
    }

    @GetMapping("/me")
    public R<Personnel> me(HttpServletRequest request) {
        Personnel user = authService.autoLogin(request);
        return user != null ? R.ok(user) : R.fail(401, "Not logged in");
    }

    @PostMapping("/change-password")
    public R<Void> changePassword(@RequestBody Map<String, String> body, HttpSession session) {
        Personnel user = (Personnel) session.getAttribute("user");
        if (user == null) return R.fail(401, "Not logged in");
        authService.changePassword(user.getId(), body.get("oldPassword"), body.get("newPassword"));
        return R.ok();
    }

    @PostMapping("/reset-password/{userId}")
    public R<Void> resetPassword(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        authService.resetPassword(userId, body.get("newPassword"));
        return R.ok();
    }
}
