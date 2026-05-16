package com.project.tracker.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.project.tracker.entity.StageCheckItem;
import com.project.tracker.mapper.StageCheckItemMapper;
import com.project.tracker.service.StageCheckItemService;
import org.springframework.stereotype.Service;

@Service
public class StageCheckItemServiceImpl extends ServiceImpl<StageCheckItemMapper, StageCheckItem> implements StageCheckItemService {
}
