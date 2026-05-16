package com.project.tracker.dto;

import com.project.tracker.entity.MonthlyOncall;
import com.project.tracker.entity.Personnel;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class MonthlyOncallVO extends MonthlyOncall {
    private Personnel oncallPerson;
    private Personnel backupPerson;
}
