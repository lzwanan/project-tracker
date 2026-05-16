package com.project.tracker.dto;

import com.project.tracker.entity.InitiativeRisk;
import java.util.List;
import lombok.Data;

@Data
public class MilestoneWithRisks {
    private Long id;
    private Long initiativeId;
    private String name;
    private String targetDate;
    private String actualDate;
    private String status;
    private List<InitiativeRisk> risks;
}
