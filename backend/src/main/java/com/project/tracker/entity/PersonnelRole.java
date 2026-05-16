package com.project.tracker.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("personnel_role")
public class PersonnelRole {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long personnelId;

    private Long roleId;
}
