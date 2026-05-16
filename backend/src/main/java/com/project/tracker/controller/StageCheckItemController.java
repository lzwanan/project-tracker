package com.project.tracker.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.project.tracker.dto.R;
import com.project.tracker.entity.StageCheckItem;
import com.project.tracker.service.StageCheckItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stages/{stageId}/check-items")
@RequiredArgsConstructor
public class StageCheckItemController {

    private final StageCheckItemService checkItemService;

    @GetMapping
    public R<List<StageCheckItem>> list(@PathVariable Long stageId) {
        return R.ok(checkItemService.list(
                new LambdaQueryWrapper<StageCheckItem>()
                        .eq(StageCheckItem::getStageId, stageId)
                        .orderByAsc(StageCheckItem::getCreatedAt)));
    }

    @GetMapping("/{id}")
    public R<StageCheckItem> get(@PathVariable Long id) {
        return R.ok(checkItemService.getById(id));
    }

    @PostMapping
    public R<StageCheckItem> create(@PathVariable Long stageId,
                                     @RequestBody StageCheckItem item) {
        item.setStageId(stageId);
        checkItemService.save(item);
        return R.ok(item);
    }

    @PutMapping("/{id}")
    public R<StageCheckItem> update(@PathVariable Long id,
                                     @RequestBody StageCheckItem item) {
        item.setId(id);
        checkItemService.updateById(item);
        return R.ok(item);
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        checkItemService.removeById(id);
        return R.ok();
    }
}
