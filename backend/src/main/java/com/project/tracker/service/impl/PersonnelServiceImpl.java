package com.project.tracker.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.project.tracker.dto.PersonnelVO;
import com.project.tracker.entity.Personnel;
import com.project.tracker.entity.PersonnelRole;
import com.project.tracker.entity.SysRole;
import com.project.tracker.mapper.PersonnelMapper;
import com.project.tracker.mapper.PersonnelRoleMapper;
import com.project.tracker.mapper.SysRoleMapper;
import com.project.tracker.service.PersonnelService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PersonnelServiceImpl extends ServiceImpl<PersonnelMapper, Personnel> implements PersonnelService {

    private final PersonnelRoleMapper personnelRoleMapper;
    private final SysRoleMapper sysRoleMapper;

    @Override
    public List<SysRole> getRolesByPersonnelId(Long id) {
        LambdaQueryWrapper<PersonnelRole> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PersonnelRole::getPersonnelId, id);
        List<PersonnelRole> personnelRoles = personnelRoleMapper.selectList(wrapper);
        List<Long> roleIds = personnelRoles.stream()
                .map(PersonnelRole::getRoleId)
                .collect(Collectors.toList());
        if (roleIds.isEmpty()) {
            return List.of();
        }
        return sysRoleMapper.selectBatchIds(roleIds);
    }

    @Override
    public void assignRoles(Long id, List<Long> roleIds) {
        LambdaQueryWrapper<PersonnelRole> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PersonnelRole::getPersonnelId, id);
        personnelRoleMapper.delete(wrapper);
        for (Long roleId : roleIds) {
            PersonnelRole pr = new PersonnelRole();
            pr.setPersonnelId(id);
            pr.setRoleId(roleId);
            personnelRoleMapper.insert(pr);
        }
    }

    @Override
    public Page<PersonnelVO> pageWithRoles(int page, int size, String keyword) {
        LambdaQueryWrapper<Personnel> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Personnel::getName, keyword)
                   .or()
                   .like(Personnel::getEmployeeId, keyword)
                   .or()
                   .like(Personnel::getEmail, keyword);
        }
        wrapper.orderByDesc(Personnel::getCreatedAt);
        Page<Personnel> pageParam = new Page<>(page, size);
        Page<Personnel> personnelPage = this.page(pageParam, wrapper);
        List<Personnel> records = personnelPage.getRecords();
        List<PersonnelVO> voList = new ArrayList<>();
        if (!records.isEmpty()) {
            List<Long> personnelIds = records.stream().map(Personnel::getId).collect(Collectors.toList());
            List<SysRole> allRoles = baseMapper.selectRolesByPersonnelIds(personnelIds);
            for (Personnel p : records) {
                PersonnelVO vo = new PersonnelVO();
                BeanUtils.copyProperties(p, vo);
                List<SysRole> roles = allRoles.stream()
                        .filter(r -> {
                            List<SysRole> personRoles = getRolesByPersonnelId(p.getId());
                            return personRoles.stream().anyMatch(pr -> pr.getId().equals(r.getId()));
                        })
                        .collect(Collectors.toList());
                vo.setRoles(roles);
                voList.add(vo);
            }
        }
        Page<PersonnelVO> result = new Page<>(page, size, personnelPage.getTotal());
        result.setRecords(voList);
        return result;
    }
}
