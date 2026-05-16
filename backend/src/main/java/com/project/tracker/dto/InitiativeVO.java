package com.project.tracker.dto;

import com.project.tracker.entity.Initiative;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class InitiativeVO extends Initiative {
    private List<MilestoneWithRisks> milestones;
}
