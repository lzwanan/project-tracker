package com.project.tracker.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.project.tracker.dto.PersonnelVO;
import com.project.tracker.entity.Personnel;
import com.project.tracker.entity.SysRole;

import java.util.List;

public interface PersonnelService extends IService<Personnel> {

    List<SysRole> getRolesByPersonnelId(Long id);

    void assignRoles(Long id, List<Long> roleIds);

    Page<PersonnelVO> pageWithRoles(int page, int size, String keyword);
}
