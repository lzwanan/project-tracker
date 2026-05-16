package com.project.tracker.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String employeeId;
    private String password;
}
