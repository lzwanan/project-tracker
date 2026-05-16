package com.project.tracker.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.project.tracker.dto.R;
import com.project.tracker.entity.InitiativeRisk;
import com.project.tracker.entity.InitiativeMilestone;
import com.project.tracker.service.InitiativeRiskService;
import com.project.tracker.service.InitiativeMilestoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/initiatives/{initiativeId}/milestones/{msId}/risks")
@RequiredArgsConstructor
public class InitiativeRiskController {

    private final InitiativeRiskService riskService;
    private final InitiativeMilestoneService milestoneService;

    @GetMapping
    public R<List<InitiativeRisk>> list(@PathVariable Long initiativeId,
                                         @PathVariable Long msId) {
        return R.ok(riskService.list(
                new LambdaQueryWrapper<InitiativeRisk>()
                        .eq(InitiativeRisk::getMilestoneId, msId)
                        .orderByDesc(InitiativeRisk::getCreatedAt)));
    }

    @GetMapping("/{id}")
    public R<InitiativeRisk> get(@PathVariable Long id) {
        return R.ok(riskService.getById(id));
    }

    @PostMapping
    public R<InitiativeRisk> create(@PathVariable Long initiativeId,
                                     @PathVariable Long msId,
                                     @RequestBody InitiativeRisk risk) {
        risk.setInitiativeId(initiativeId);
        risk.setMilestoneId(msId);
        riskService.save(risk);
        checkMilestoneCompletion(msId);
        return R.ok(risk);
    }

    @PutMapping("/{id}")
    public R<InitiativeRisk> update(@PathVariable Long msId,
                                     @PathVariable Long id,
                                     @RequestBody InitiativeRisk risk) {
        risk.setId(id);
        riskService.updateById(risk);
        checkMilestoneCompletion(msId);
        return R.ok(risk);
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long msId,
                           @PathVariable Long id) {
        riskService.removeById(id);
        checkMilestoneCompletion(msId);
        return R.ok();
    }

    private void checkMilestoneCompletion(Long msId) {
        List<InitiativeRisk> risks = riskService.list(
                new LambdaQueryWrapper<InitiativeRisk>().eq(InitiativeRisk::getMilestoneId, msId));
        boolean allResolved = risks.isEmpty() ||
                risks.stream().allMatch(r -> "RESOLVED".equalsIgnoreCase(r.getStatus())
                        || "CLOSED".equalsIgnoreCase(r.getStatus()));
        InitiativeMilestone milestone = milestoneService.getById(msId);
        if (milestone != null) {
            milestone.setStatus(allResolved ? "COMPLETED" : "IN_PROGRESS");
            milestoneService.updateById(milestone);
        }
    }
}
