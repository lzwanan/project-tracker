package com.project.tracker.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.project.tracker.dto.MonthlyOncallVO;
import com.project.tracker.dto.R;
import com.project.tracker.entity.MonthlyOncall;
import com.project.tracker.service.MonthlyOncallService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/oncalls")
@RequiredArgsConstructor
public class MonthlyOncallController {

    private final MonthlyOncallService oncallService;

    @GetMapping
    public R<List<MonthlyOncallVO>> list(@RequestParam(required = false) String yearMonth) {
        return R.ok(oncallService.listWithPersonnel(yearMonth));
    }

    @GetMapping("/{id}")
    public R<MonthlyOncallVO> get(@PathVariable Long id) {
        var o = oncallService.getById(id);
        return o != null ? R.ok(null) : R.fail("not found");
    }

    @PostMapping
    public R<MonthlyOncall> create(@RequestBody MonthlyOncall oncall) {
        oncallService.save(oncall);
        return R.ok(oncall);
    }

    @PutMapping("/{id}")
    public R<MonthlyOncall> update(@PathVariable Long id, @RequestBody MonthlyOncall oncall) {
        oncall.setId(id);
        oncallService.updateById(oncall);
        return R.ok(oncall);
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        oncallService.removeById(id);
        return R.ok();
    }
}
