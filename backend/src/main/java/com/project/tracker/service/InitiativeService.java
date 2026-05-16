package com.project.tracker.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.project.tracker.dto.InitiativeVO;
import com.project.tracker.entity.Initiative;

public interface InitiativeService extends IService<Initiative> {

    InitiativeVO getDetail(Long id);

    Page<InitiativeVO> pageList(int page, int size, String keyword);
}
