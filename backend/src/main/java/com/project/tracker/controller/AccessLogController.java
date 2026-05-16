package com.project.tracker.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.project.tracker.dto.R;
import com.project.tracker.entity.AccessLog;
import com.project.tracker.mapper.AccessLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/system/access-logs")
@RequiredArgsConstructor
public class AccessLogController {

    private final AccessLogMapper accessLogMapper;

    @GetMapping
    public R<Page<AccessLog>> list(@RequestParam(defaultValue = "1") int page,
                                   @RequestParam(defaultValue = "10") int size) {
        LambdaQueryWrapper<AccessLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(AccessLog::getCreateTime);
        Page<AccessLog> result = accessLogMapper.selectPage(new Page<>(page, size), wrapper);
        return R.ok(result);
    }

    @DeleteMapping
    public R<Integer> cleanOld() {
        LambdaQueryWrapper<AccessLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.le(AccessLog::getCreateTime, LocalDateTime.now().minusDays(7));
        int count = accessLogMapper.delete(wrapper);
        return R.ok(count);
    }
}
