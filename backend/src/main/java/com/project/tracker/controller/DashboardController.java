package com.project.tracker.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.project.tracker.dto.DashboardEvent;
import com.project.tracker.dto.R;
import com.project.tracker.entity.*;
import com.project.tracker.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final VersionMapper versionMapper;
    private final VersionStageMapper stageMapper;
    private final MonthlyOncallMapper oncallMapper;
    private final InitiativeMapper initiativeMapper;
    private final InitiativeMilestoneMapper milestoneMapper;

    @GetMapping("/events")
    public R<List<DashboardEvent>> events(@RequestParam int year,
                                           @RequestParam(required = false) Integer month) {
        List<DashboardEvent> list = new ArrayList<>();
        LocalDate rangeStart, rangeEnd;
        if (month != null) {
            rangeStart = LocalDate.of(year, month, 1);
            rangeEnd = rangeStart.plusMonths(1).minusDays(1);
        } else {
            rangeStart = LocalDate.of(year, 1, 1);
            rangeEnd = LocalDate.of(year, 12, 31);
        }

        for (Version v : versionMapper.selectList(null)) {
            if (inRange(v.getPlannedDate(), v.getActualDate(), rangeStart, rangeEnd)) {
                DashboardEvent e = new DashboardEvent();
                e.setId(v.getId()); e.setTitle(v.getName()); e.setType("version");
                e.setStartDate(v.getPlannedDate()); e.setEndDate(v.getActualDate());
                e.setColor("#3b82f6"); e.setLink("/versions/" + v.getId());
                list.add(e);
            }
            for (VersionStage s : stageMapper.selectList(
                    new LambdaQueryWrapper<VersionStage>().eq(VersionStage::getVersionId, v.getId()).isNotNull(VersionStage::getDueDate))) {
                if (s.getDueDate() != null && inRange(s.getDueDate(), s.getDueDate(), rangeStart, rangeEnd)) {
                    DashboardEvent e = new DashboardEvent();
                    e.setId(s.getId()); e.setTitle(v.getName() + " · " + s.getName()); e.setType("version");
                    e.setSubtype("stage"); e.setStartDate(s.getDueDate()); e.setEndDate(s.getDueDate());
                    e.setColor("#60a5fa"); e.setLink("/versions/" + v.getId());
                    list.add(e);
                }
            }
        }

        for (MonthlyOncall o : oncallMapper.selectList(null)) {
            if (o.getYearMonth() == null) continue;
            String[] parts = o.getYearMonth().split("-");
            LocalDate os = LocalDate.of(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), 1);
            LocalDate oe = os.plusMonths(1).minusDays(1);
            if (inRange(os, oe, rangeStart, rangeEnd)) {
                DashboardEvent e = new DashboardEvent();
                e.setId(o.getId()); e.setTitle("Oncall · " + o.getYearMonth()); e.setType("oncall");
                e.setStartDate(os); e.setEndDate(oe);
                e.setColor("#10b981"); e.setLink("/oncalls");
                list.add(e);
            }
        }

        for (Initiative init : initiativeMapper.selectList(null)) {
            if (inRange(init.getStartDate(), init.getEndDate(), rangeStart, rangeEnd)) {
                DashboardEvent e = new DashboardEvent();
                e.setId(init.getId()); e.setTitle(init.getName()); e.setType("initiative");
                e.setStartDate(init.getStartDate()); e.setEndDate(init.getEndDate());
                e.setColor("#7c3aed"); e.setLink("/initiatives/" + init.getId());
                list.add(e);
            }
            for (InitiativeMilestone ms : milestoneMapper.selectList(
                    new LambdaQueryWrapper<InitiativeMilestone>()
                            .eq(InitiativeMilestone::getInitiativeId, init.getId())
                            .isNotNull(InitiativeMilestone::getTargetDate))) {
                if (ms.getTargetDate() != null && inRange(ms.getTargetDate(), ms.getTargetDate(), rangeStart, rangeEnd)) {
                    DashboardEvent e = new DashboardEvent();
                    e.setId(ms.getId()); e.setTitle(init.getName() + " · " + ms.getName()); e.setType("initiative");
                    e.setSubtype("milestone"); e.setStartDate(ms.getTargetDate()); e.setEndDate(ms.getTargetDate());
                    e.setColor("#f59e0b"); e.setLink("/initiatives/" + init.getId());
                    list.add(e);
                }
            }
        }

        return R.ok(list);
    }

    private boolean inRange(LocalDate s, LocalDate e, LocalDate rs, LocalDate re) {
        if (s == null && e == null) return false;
        LocalDate a = s != null ? s : e;
        LocalDate b = e != null ? e : s;
        return !a.isAfter(re) && !b.isBefore(rs);
    }
}
