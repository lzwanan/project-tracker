package com.project.tracker.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("initiative_risk")
public class InitiativeRisk {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long initiativeId;

    private Long milestoneId;

    private String title;

    private String description;

    private String severity;

    private String status;

    private String owner;

    private LocalDate identifiedDate;

    private LocalDate resolutionDate;

    private String progress;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
