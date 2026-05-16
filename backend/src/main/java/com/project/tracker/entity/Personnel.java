package com.project.tracker.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("personnel")
public class Personnel {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String employeeId;

    private String name;

    private String email;

    private String password;

    private String rememberToken;

    private Boolean firstLogin;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
