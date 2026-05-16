package com.project.tracker.dto;

import com.project.tracker.entity.Personnel;
import com.project.tracker.entity.SysRole;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PersonnelVO extends Personnel {
    private List<SysRole> roles;
}
