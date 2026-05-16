package com.project.tracker.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.project.tracker.entity.Personnel;
import com.project.tracker.entity.SysRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PersonnelMapper extends BaseMapper<Personnel> {

    List<SysRole> selectRolesByPersonnelIds(@Param("personnelIds") List<Long> personnelIds);
}
