package com.project.tracker.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.project.tracker.dto.R;
import com.project.tracker.entity.Version;
import com.project.tracker.entity.VersionStage;
import com.project.tracker.service.VersionService;
import com.project.tracker.service.VersionStageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/versions/{versionId}/stages")
@RequiredArgsConstructor
public class VersionStageController {

    private final VersionStageService stageService;
    private final VersionService versionService;

    @GetMapping
    public R<List<VersionStage>> list(@PathVariable Long versionId) {
        return R.ok(stageService.list(
                new LambdaQueryWrapper<VersionStage>()
                        .eq(VersionStage::getVersionId, versionId)
                        .orderByAsc(VersionStage::getOrderSeq)));
    }

    @GetMapping("/{id}")
    public R<VersionStage> get(@PathVariable Long id) {
        return R.ok(stageService.getById(id));
    }

    @PostMapping
    public R<VersionStage> create(@PathVariable Long versionId,
                                   @RequestBody VersionStage stage) {
        stage.setVersionId(versionId);
        if (stage.getParentId() != null) {
            validateDueDate(stage);
        }
        stageService.save(stage);
        return R.ok(stage);
    }

    @PutMapping("/{id}")
    public R<VersionStage> update(@PathVariable Long versionId,
                                   @PathVariable Long id,
                                   @RequestBody VersionStage stage) {
        LambdaUpdateWrapper<VersionStage> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(VersionStage::getId, id).eq(VersionStage::getVersionId, versionId);
        if (stage.getName() != null) wrapper.set(VersionStage::getName, stage.getName());
        if (stage.getOrderSeq() != null) wrapper.set(VersionStage::getOrderSeq, stage.getOrderSeq());
        if (stage.getStatus() != null) wrapper.set(VersionStage::getStatus, stage.getStatus());
        if (stage.getDueDate() != null) wrapper.set(VersionStage::getDueDate, stage.getDueDate());
        if (stage.getAssignee() != null) wrapper.set(VersionStage::getAssignee, stage.getAssignee());
        if (stage.getParentId() != null) wrapper.set(VersionStage::getParentId, stage.getParentId());
        stageService.update(wrapper);

        if (stage.getStatus() != null) {
            cascadeStatus(versionId, id, stage.getStatus());
        }
        checkVersionProgress(versionId);
        return R.ok(stageService.getById(id));
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        stageService.removeById(id);
        return R.ok();
    }

    private void cascadeStatus(Long versionId, Long stageId, String newStatus) {
        cascadeDownRecursive(versionId, stageId, newStatus);
        cascadeUp(versionId, stageId);
        checkVersionProgress(versionId);
    }

    private void cascadeDownRecursive(Long versionId, Long parentId, String newStatus) {
        List<VersionStage> children = stageService.list(
                new LambdaQueryWrapper<VersionStage>()
                        .eq(VersionStage::getVersionId, versionId)
                        .eq(VersionStage::getParentId, parentId));
        for (VersionStage child : children) {
            if (!"COMPLETED".equalsIgnoreCase(child.getStatus())
                    && !"SKIPPED".equalsIgnoreCase(child.getStatus())) {
                child.setStatus(newStatus);
                stageService.updateById(child);
            }
            cascadeDownRecursive(versionId, child.getId(), newStatus);
        }
    }

    private void cascadeUp(Long versionId, Long stageId) {
        VersionStage stage = stageService.getById(stageId);
        if (stage == null || stage.getParentId() == null) return;
        List<VersionStage> siblings = stageService.list(
                new LambdaQueryWrapper<VersionStage>()
                        .eq(VersionStage::getVersionId, versionId)
                        .eq(VersionStage::getParentId, stage.getParentId()));
        boolean allDone = siblings.stream()
                .allMatch(s -> "COMPLETED".equalsIgnoreCase(s.getStatus())
                        || "SKIPPED".equalsIgnoreCase(s.getStatus()));
        if (allDone) {
            VersionStage parent = stageService.getById(stage.getParentId());
            if (parent != null && !"COMPLETED".equalsIgnoreCase(parent.getStatus())) {
                parent.setStatus("COMPLETED");
                stageService.updateById(parent);
                cascadeUp(versionId, parent.getId());
            }
        }
    }

    private void checkVersionProgress(Long versionId) {
        List<VersionStage> allStages = stageService.list(
                new LambdaQueryWrapper<VersionStage>()
                        .eq(VersionStage::getVersionId, versionId));
        if (allStages.isEmpty()) return;
        boolean allDone = allStages.stream()
                .allMatch(s -> "COMPLETED".equalsIgnoreCase(s.getStatus())
                        || "SKIPPED".equalsIgnoreCase(s.getStatus()));
        if (allDone) {
            Version version = versionService.getById(versionId);
            if (version != null && !"RELEASED".equalsIgnoreCase(version.getStatus())) {
                version.setStatus("RELEASED");
                versionService.updateById(version);
            }
        }
    }

    private void validateDueDate(VersionStage stage) {
        Version version = versionService.getById(stage.getVersionId());
        if (stage.getParentId() != null && stage.getParentId() > 0) {
            VersionStage parent = stageService.getById(stage.getParentId());
            if (parent != null && parent.getDueDate() != null
                    && stage.getDueDate() != null && stage.getDueDate().isAfter(parent.getDueDate())) {
                throw new RuntimeException("Child stage due date must not exceed parent stage due date");
            }
        }
        if (version != null && version.getPlannedDate() != null
                && stage.getDueDate() != null && stage.getDueDate().isAfter(version.getPlannedDate())) {
            throw new RuntimeException("Stage due date must not exceed version planned date");
        }
    }
}
