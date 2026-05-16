package com.project.tracker.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.project.tracker.dto.InitiativeVO;
import com.project.tracker.dto.R;
import com.project.tracker.entity.Initiative;
import com.project.tracker.service.InitiativeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/initiatives")
@RequiredArgsConstructor
public class InitiativeController {

    private final InitiativeService initiativeService;

    @GetMapping
    public R<Page<InitiativeVO>> list(@RequestParam(defaultValue = "1") int page,
                                       @RequestParam(defaultValue = "10") int size,
                                       @RequestParam(required = false) String keyword) {
        return R.ok(initiativeService.pageList(page, size, keyword));
    }

    @GetMapping("/{id}")
    public R<InitiativeVO> detail(@PathVariable Long id) {
        return R.ok(initiativeService.getDetail(id));
    }

    @PostMapping
    public R<Initiative> create(@RequestBody Initiative initiative) {
        initiativeService.save(initiative);
        return R.ok(initiative);
    }

    @PutMapping("/{id}")
    public R<Initiative> update(@PathVariable Long id, @RequestBody Initiative initiative) {
        initiative.setId(id);
        initiativeService.updateById(initiative);
        return R.ok(initiative);
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        initiativeService.removeById(id);
        return R.ok();
    }
}
