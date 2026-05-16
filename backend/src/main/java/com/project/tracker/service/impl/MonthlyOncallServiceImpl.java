package com.project.tracker.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.project.tracker.dto.MonthlyOncallVO;
import com.project.tracker.entity.MonthlyOncall;
import com.project.tracker.mapper.MonthlyOncallMapper;
import com.project.tracker.service.MonthlyOncallService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MonthlyOncallServiceImpl extends ServiceImpl<MonthlyOncallMapper, MonthlyOncall> implements MonthlyOncallService {

    @Override
    public List<MonthlyOncallVO> listWithPersonnel(String yearMonth) {
        return baseMapper.selectListWithPersonnel(yearMonth);
    }
}
