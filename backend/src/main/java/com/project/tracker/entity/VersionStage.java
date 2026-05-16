package com.project.tracker.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("version_stage")
public class VersionStage {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long versionId;

    private Long parentId;

    private String name;

    private Integer orderSeq;

    private String status;

    private LocalDate dueDate;

    private String assignee;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
