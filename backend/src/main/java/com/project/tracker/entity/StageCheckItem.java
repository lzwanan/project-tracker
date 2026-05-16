package com.project.tracker.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("stage_check_item")
public class StageCheckItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long stageId;

    private String name;

    private String description;

    private String status;

    private String assignee;

    private String remark;

    private LocalDateTime completedAt;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
