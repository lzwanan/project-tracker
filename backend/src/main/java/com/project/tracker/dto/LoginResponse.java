package com.project.tracker.dto;

import com.project.tracker.entity.Personnel;
import lombok.Data;

@Data
public class LoginResponse {
    private Personnel user;
    private boolean firstLogin;
    private String token;
}
