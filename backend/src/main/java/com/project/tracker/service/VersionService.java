package com.project.tracker.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.project.tracker.dto.VersionVO;
import com.project.tracker.entity.Version;

public interface VersionService extends IService<Version> {

    VersionVO getDetail(Long id);

    Page<VersionVO> pageList(int page, int size, String keyword, String sortBy, String sortOrder, String status);
}
