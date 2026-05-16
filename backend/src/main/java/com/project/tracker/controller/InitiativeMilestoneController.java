package com.project.tracker.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.project.tracker.dto.R;
import com.project.tracker.entity.InitiativeMilestone;
import com.project.tracker.service.InitiativeMilestoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/initiatives/{initiativeId}/milestones")
@RequiredArgsConstructor
public class InitiativeMilestoneController {

    private final InitiativeMilestoneService milestoneService;

    @GetMapping
    public R<List<InitiativeMilestone>> list(@PathVariable Long initiativeId) {
        return R.ok(milestoneService.list(
                new LambdaQueryWrapper<InitiativeMilestone>()
                        .eq(InitiativeMilestone::getInitiativeId, initiativeId)
                        .orderByAsc(InitiativeMilestone::getTargetDate)));
    }

    @GetMapping("/{id}")
    public R<InitiativeMilestone> get(@PathVariable Long id) {
        return R.ok(milestoneService.getById(id));
    }

    @PostMapping
    public R<InitiativeMilestone> create(@PathVariable Long initiativeId,
                                          @RequestBody InitiativeMilestone milestone) {
        milestone.setInitiativeId(initiativeId);
        milestoneService.save(milestone);
        return R.ok(milestone);
    }

    @PutMapping("/{id}")
    public R<InitiativeMilestone> update(@PathVariable Long id,
                                          @RequestBody InitiativeMilestone milestone) {
        milestone.setId(id);
        milestoneService.updateById(milestone);
        return R.ok(milestone);
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        milestoneService.removeById(id);
        return R.ok();
    }
}
