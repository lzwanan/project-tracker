package com.project.tracker.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.project.tracker.dto.MonthlyOncallVO;
import com.project.tracker.entity.MonthlyOncall;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MonthlyOncallMapper extends BaseMapper<MonthlyOncall> {

    List<MonthlyOncallVO> selectListWithPersonnel(@Param("yearMonth") String yearMonth);
}
