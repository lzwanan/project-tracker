package com.project.tracker.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.project.tracker.dto.VersionVO;
import com.project.tracker.entity.Version;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface VersionMapper extends BaseMapper<Version> {

    VersionVO selectVersionDetail(@Param("id") Long id);
}
