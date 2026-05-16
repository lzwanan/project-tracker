package com.project.tracker.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("initiative_milestone")
public class InitiativeMilestone {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long initiativeId;

    private String name;

    private LocalDate targetDate;

    private LocalDate actualDate;

    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
