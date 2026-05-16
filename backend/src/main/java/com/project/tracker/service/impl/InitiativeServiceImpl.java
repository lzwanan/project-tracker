package com.project.tracker.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.project.tracker.dto.InitiativeVO;
import com.project.tracker.entity.Initiative;
import com.project.tracker.mapper.InitiativeMapper;
import com.project.tracker.service.InitiativeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InitiativeServiceImpl extends ServiceImpl<InitiativeMapper, Initiative> implements InitiativeService {

    @Override
    public InitiativeVO getDetail(Long id) {
        return baseMapper.selectDetail(id);
    }

    @Override
    public Page<InitiativeVO> pageList(int page, int size, String keyword) {
        LambdaQueryWrapper<Initiative> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Initiative::getName, keyword)
                   .or()
                   .like(Initiative::getDescription, keyword);
        }
        wrapper.orderByDesc(Initiative::getCreatedAt);
        Page<Initiative> pageParam = new Page<>(page, size);
        Page<Initiative> initiativePage = this.page(pageParam, wrapper);
        List<InitiativeVO> voList = initiativePage.getRecords().stream()
                .map(i -> {
                    InitiativeVO vo = new InitiativeVO();
                    BeanUtils.copyProperties(i, vo);
                    return vo;
                })
                .collect(Collectors.toList());
        Page<InitiativeVO> result = new Page<>(page, size, initiativePage.getTotal());
        result.setRecords(voList);
        return result;
    }
}
