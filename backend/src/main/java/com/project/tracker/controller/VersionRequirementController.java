package com.project.tracker.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.project.tracker.dto.R;
import com.project.tracker.entity.VersionRequirement;
import com.project.tracker.mapper.VersionRequirementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/versions/{versionId}/requirements")
@RequiredArgsConstructor
public class VersionRequirementController {

    private final VersionRequirementMapper requirementMapper;

    @GetMapping
    public R<List<VersionRequirement>> list(@PathVariable Long versionId) {
        return R.ok(requirementMapper.selectList(
                new LambdaQueryWrapper<VersionRequirement>()
                        .eq(VersionRequirement::getVersionId, versionId)
                        .orderByAsc(VersionRequirement::getCreatedAt)));
    }

    @GetMapping("/{id}")
    public R<VersionRequirement> get(@PathVariable Long id) {
        return R.ok(requirementMapper.selectById(id));
    }

    @PostMapping
    public R<VersionRequirement> create(@PathVariable Long versionId,
                                         @RequestBody VersionRequirement requirement) {
        requirement.setVersionId(versionId);
        requirementMapper.insert(requirement);
        return R.ok(requirement);
    }

    @PutMapping("/{id}")
    public R<VersionRequirement> update(@PathVariable Long id,
                                         @RequestBody VersionRequirement requirement) {
        requirement.setId(id);
        requirementMapper.updateById(requirement);
        return R.ok(requirement);
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        requirementMapper.deleteById(id);
        return R.ok();
    }
}
