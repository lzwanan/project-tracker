package com.project.tracker.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("monthly_oncall")
public class MonthlyOncall {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String yearMonth;

    private Long oncallPersonId;

    private Long backupPersonId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
