package com.project.tracker.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.project.tracker.dto.R;
import com.project.tracker.entity.SysRole;
import com.project.tracker.service.SysRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class SysRoleController {

    private final SysRoleService sysRoleService;

    @GetMapping
    public R<List<SysRole>> list() {
        return R.ok(sysRoleService.list());
    }

    @GetMapping("/all")
    public R<List<SysRole>> all() {
        return R.ok(sysRoleService.list());
    }

    @GetMapping("/{id}")
    public R<SysRole> get(@PathVariable Long id) {
        return R.ok(sysRoleService.getById(id));
    }

    @PostMapping
    public R<SysRole> create(@RequestBody SysRole role) {
        sysRoleService.save(role);
        return R.ok(role);
    }

    @PutMapping("/{id}")
    public R<SysRole> update(@PathVariable Long id, @RequestBody SysRole role) {
        role.setId(id);
        sysRoleService.updateById(role);
        return R.ok(role);
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        sysRoleService.removeById(id);
        return R.ok();
    }
}
