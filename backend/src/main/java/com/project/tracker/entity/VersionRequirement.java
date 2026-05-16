package com.project.tracker.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("version_requirement")
public class VersionRequirement {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long versionId;

    private String name;

    private String reqNumber;

    private String assignee;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
