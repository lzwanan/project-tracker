package com.project.tracker.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.project.tracker.entity.InitiativeMilestone;
import com.project.tracker.mapper.InitiativeMilestoneMapper;
import com.project.tracker.service.InitiativeMilestoneService;
import org.springframework.stereotype.Service;

@Service
public class InitiativeMilestoneServiceImpl extends ServiceImpl<InitiativeMilestoneMapper, InitiativeMilestone> implements InitiativeMilestoneService {
}
