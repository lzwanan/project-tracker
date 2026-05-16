package com.project.tracker.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.project.tracker.dto.MonthlyOncallVO;
import com.project.tracker.entity.MonthlyOncall;

import java.util.List;

public interface MonthlyOncallService extends IService<MonthlyOncall> {

    List<MonthlyOncallVO> listWithPersonnel(String yearMonth);
}
