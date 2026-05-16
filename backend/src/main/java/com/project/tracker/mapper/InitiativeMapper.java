package com.project.tracker.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.project.tracker.dto.InitiativeVO;
import com.project.tracker.entity.Initiative;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface InitiativeMapper extends BaseMapper<Initiative> {

    InitiativeVO selectDetail(@Param("id") Long id);
}
