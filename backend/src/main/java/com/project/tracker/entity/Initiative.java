package com.project.tracker.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("initiative")
public class Initiative {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String description;

    private String status;

    private String owner;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate actualEndDate;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
