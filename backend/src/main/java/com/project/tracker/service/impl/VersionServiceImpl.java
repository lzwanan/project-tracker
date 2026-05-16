package com.project.tracker.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.project.tracker.dto.StageVO;
import com.project.tracker.dto.VersionVO;
import com.project.tracker.entity.Version;
import com.project.tracker.mapper.VersionMapper;
import com.project.tracker.service.StageTreeBuilder;
import com.project.tracker.service.VersionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VersionServiceImpl extends ServiceImpl<VersionMapper, Version> implements VersionService {

    @Override
    public VersionVO getDetail(Long id) {
        VersionVO vo = baseMapper.selectVersionDetail(id);
        if (vo != null && vo.getStages() != null) {
            vo.setStages(StageTreeBuilder.buildTree(vo.getStages()));
        }
        return vo;
    }

    @Override
    public Page<VersionVO> pageList(int page, int size, String keyword, String sortBy, String sortOrder, String status) {
        LambdaQueryWrapper<Version> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Version::getName, keyword)
                   .or()
                   .like(Version::getDescription, keyword);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Version::getStatus, status);
        }

        if ("progress".equals(sortBy)) {
            List<Version> allVersions = this.list(wrapper);
            allVersions.sort((a, b) -> {
                VersionVO va = baseMapper.selectVersionDetail(a.getId());
                VersionVO vb = baseMapper.selectVersionDetail(b.getId());
                double pa = calcProgress(va);
                double pb = calcProgress(vb);
                int cmp = Double.compare(pa, pb);
                return "desc".equalsIgnoreCase(sortOrder) ? -cmp : cmp;
            });
            int total = allVersions.size();
            int fromIndex = (page - 1) * size;
            int toIndex = Math.min(fromIndex + size, total);
            List<VersionVO> voList = allVersions.subList(fromIndex, toIndex).stream()
                    .map(v -> {
                        VersionVO vo = baseMapper.selectVersionDetail(v.getId());
                        if (vo != null && vo.getStages() != null) {
                            vo.setStages(StageTreeBuilder.buildTree(vo.getStages()));
                        }
                        return vo;
                    })
                    .collect(Collectors.toList());
            Page<VersionVO> result = new Page<>(page, size, total);
            result.setRecords(voList);
            return result;
        } else {
            if ("plannedDate".equals(sortBy)) {
                if ("desc".equalsIgnoreCase(sortOrder)) {
                    wrapper.orderByDesc(Version::getPlannedDate);
                } else {
                    wrapper.orderByAsc(Version::getPlannedDate);
                }
            } else {
                wrapper.orderByDesc(Version::getCreatedAt);
            }
            Page<Version> pageParam = new Page<>(page, size);
            Page<Version> versionPage = this.page(pageParam, wrapper);
            List<VersionVO> voList = versionPage.getRecords().stream()
                    .map(v -> {
                        VersionVO vo = baseMapper.selectVersionDetail(v.getId());
                        if (vo != null && vo.getStages() != null) {
                            vo.setStages(StageTreeBuilder.buildTree(vo.getStages()));
                        }
                        return vo;
                    })
                    .collect(Collectors.toList());
            Page<VersionVO> result = new Page<>(page, size, versionPage.getTotal());
            result.setRecords(voList);
            return result;
        }
    }

    private double calcProgress(VersionVO vo) {
        if (vo == null || vo.getStages() == null || vo.getStages().isEmpty()) {
            return 0;
        }
        List<StageVO> flat = flatten(vo.getStages());
        long done = flat.stream()
                .filter(s -> "COMPLETED".equalsIgnoreCase(s.getStatus())
                        || "SKIPPED".equalsIgnoreCase(s.getStatus()))
                .count();
        return flat.isEmpty() ? 0 : (double) done / flat.size();
    }

    private List<StageVO> flatten(List<StageVO> stages) {
        List<StageVO> result = new ArrayList<>();
        for (StageVO stage : stages) {
            result.add(stage);
            if (stage.getChildren() != null) {
                result.addAll(flatten(stage.getChildren()));
            }
        }
        return result;
    }
}
