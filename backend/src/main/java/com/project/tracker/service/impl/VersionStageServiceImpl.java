package com.project.tracker.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.project.tracker.entity.VersionStage;
import com.project.tracker.mapper.VersionStageMapper;
import com.project.tracker.service.VersionStageService;
import org.springframework.stereotype.Service;

@Service
public class VersionStageServiceImpl extends ServiceImpl<VersionStageMapper, VersionStage> implements VersionStageService {
}
