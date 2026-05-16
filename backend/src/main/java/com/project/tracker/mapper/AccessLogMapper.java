package com.project.tracker.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.project.tracker.entity.AccessLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AccessLogMapper extends BaseMapper<AccessLog> {
}
