package com.project.tracker.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.project.tracker.dto.R;
import com.project.tracker.dto.VersionVO;
import com.project.tracker.entity.Version;
import com.project.tracker.entity.VersionRequirement;
import com.project.tracker.entity.VersionStage;
import com.project.tracker.mapper.VersionRequirementMapper;
import com.project.tracker.service.VersionService;
import com.project.tracker.service.VersionStageService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/versions")
@RequiredArgsConstructor
public class VersionController {

    private final VersionService versionService;
    private final VersionStageService versionStageService;
    private final VersionRequirementMapper versionRequirementMapper;

    @GetMapping
    public R<Page<VersionVO>> list(@RequestParam(defaultValue = "1") int page,
                                    @RequestParam(defaultValue = "10") int size,
                                    @RequestParam(required = false) String keyword,
                                    @RequestParam(required = false) String sortBy,
                                    @RequestParam(required = false) String sortOrder,
                                    @RequestParam(required = false) String status) {
        return R.ok(versionService.pageList(page, size, keyword, sortBy, sortOrder, status));
    }

    @GetMapping("/{id}")
    public R<VersionVO> detail(@PathVariable Long id) {
        return R.ok(versionService.getDetail(id));
    }

    @PostMapping
    public R<Version> create(@RequestBody Version version) {
        versionService.save(version);
        return R.ok(version);
    }

    @PutMapping("/{id}")
    public R<Version> update(@PathVariable Long id, @RequestBody Version version) {
        LambdaUpdateWrapper<Version> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Version::getId, id);
        if (version.getName() != null) wrapper.set(Version::getName, version.getName());
        if (version.getDescription() != null) wrapper.set(Version::getDescription, version.getDescription());
        if (version.getStatus() != null) wrapper.set(Version::getStatus, version.getStatus());
        if (version.getOwner() != null) wrapper.set(Version::getOwner, version.getOwner());
        if (version.getPlannedDate() != null) wrapper.set(Version::getPlannedDate, version.getPlannedDate());
        if (version.getActualDate() != null) wrapper.set(Version::getActualDate, version.getActualDate());
        versionService.update(wrapper);
        return R.ok(versionService.getById(id));
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        versionService.removeById(id);
        return R.ok();
    }

    @PostMapping("/copy/{id}")
    public R<Version> copy(@PathVariable Long id, @RequestParam String newName) {
        VersionVO detail = versionService.getDetail(id);
        if (detail == null) return R.fail("Version not found");

        Version newVersion = new Version();
        newVersion.setName(newName);
        newVersion.setDescription(detail.getDescription());
        newVersion.setStatus("DRAFT");
        newVersion.setOwner(detail.getOwner());
        versionService.save(newVersion);

        if (detail.getRequirements() != null) {
            for (var req : detail.getRequirements()) {
                VersionRequirement newReq = new VersionRequirement();
                newReq.setVersionId(newVersion.getId());
                newReq.setName(req.getName());
                newReq.setReqNumber(req.getReqNumber());
                newReq.setAssignee(req.getAssignee());
                versionRequirementMapper.insert(newReq);
            }
        }

        if (detail.getStages() != null) {
            for (var stage : detail.getStages()) {
                copyStagesRecursive(stage, newVersion.getId(), null);
            }
        }

        return R.ok(newVersion);
    }

    private void copyStagesRecursive(com.project.tracker.dto.StageVO src, Long newVersionId, Long newParentId) {
        VersionStage newStage = new VersionStage();
        newStage.setVersionId(newVersionId);
        newStage.setParentId(newParentId);
        newStage.setName(src.getName());
        newStage.setOrderSeq(src.getOrderSeq());
        newStage.setStatus(src.getStatus());
        if (src.getDueDate() != null && !src.getDueDate().isEmpty()) {
            try { newStage.setDueDate(LocalDate.parse(src.getDueDate())); } catch (Exception ignored) {}
        }
        newStage.setAssignee(src.getAssignee());
        versionStageService.save(newStage);
        if (src.getChildren() != null) {
            for (var child : src.getChildren()) {
                copyStagesRecursive(child, newVersionId, newStage.getId());
            }
        }
    }

    @GetMapping("/export/template")
    public void exportTemplate(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition",
                "attachment; filename=" + URLEncoder.encode("版本导入模板.xlsx", StandardCharsets.UTF_8));
        Workbook wb = new XSSFWorkbook();

        Sheet sheet1 = wb.createSheet("版本信息");
        Row h1 = sheet1.createRow(0);
        String[] cols1 = {"名称", "描述", "负责人", "计划日期", "实际日期"};
        for (int i = 0; i < cols1.length; i++) h1.createCell(i).setCellValue(cols1[i]);

        Sheet sheet2 = wb.createSheet("版本需求");
        Row h2 = sheet2.createRow(0);
        String[] cols2 = {"版本名称", "需求名称", "需求编号", "负责人"};
        for (int i = 0; i < cols2.length; i++) h2.createCell(i).setCellValue(cols2[i]);

        Sheet sheet3 = wb.createSheet("阶段");
        Row h3 = sheet3.createRow(0);
        String[] cols3 = {"版本名称", "阶段名称", "父阶段名称", "顺序", "截止日期", "负责人"};
        for (int i = 0; i < cols3.length; i++) h3.createCell(i).setCellValue(cols3[i]);

        wb.write(response.getOutputStream());
        wb.close();
    }

    @PostMapping("/import")
    public R<Version> importVersion(@RequestParam("file") MultipartFile file) throws IOException {
        Workbook wb = new XSSFWorkbook(file.getInputStream());

        Sheet sheet1 = wb.getSheet("版本信息");
        Row row1 = sheet1.getRow(1);
        Version version = new Version();
        version.setName(getCellString(row1.getCell(0)));
        version.setDescription(getCellString(row1.getCell(1)));
        version.setOwner(getCellString(row1.getCell(2)));
        try { version.setPlannedDate(LocalDate.parse(getCellString(row1.getCell(3)))); } catch (Exception ignored) {}
        try { version.setActualDate(LocalDate.parse(getCellString(row1.getCell(4)))); } catch (Exception ignored) {}
        version.setStatus("DRAFT");
        versionService.save(version);

        Sheet sheet2 = wb.getSheet("版本需求");
        for (int i = 1; i <= sheet2.getLastRowNum(); i++) {
            Row row = sheet2.getRow(i);
            if (row == null) continue;
            VersionRequirement req = new VersionRequirement();
            req.setVersionId(version.getId());
            req.setName(getCellString(row.getCell(1)));
            req.setReqNumber(getCellString(row.getCell(2)));
            req.setAssignee(getCellString(row.getCell(3)));
            if (req.getName() != null && !req.getName().isEmpty()) {
                versionRequirementMapper.insert(req);
            }
        }

        Sheet sheet3 = wb.getSheet("阶段");
        for (int i = 1; i <= sheet3.getLastRowNum(); i++) {
            Row row = sheet3.getRow(i);
            if (row == null) continue;
            VersionStage stage = new VersionStage();
            stage.setVersionId(version.getId());
            stage.setName(getCellString(row.getCell(1)));
            String parentName = getCellString(row.getCell(2));
            if (parentName != null && !parentName.isEmpty()) {
                List<VersionStage> siblings = versionStageService.list(
                        new LambdaQueryWrapper<VersionStage>()
                                .eq(VersionStage::getVersionId, version.getId())
                                .eq(VersionStage::getName, parentName));
                if (!siblings.isEmpty()) {
                    stage.setParentId(siblings.get(0).getId());
                }
            }
            try { stage.setOrderSeq(Integer.parseInt(getCellString(row.getCell(3)))); } catch (Exception ignored) {}
            try { stage.setDueDate(LocalDate.parse(getCellString(row.getCell(4)))); } catch (Exception ignored) {}
            stage.setAssignee(getCellString(row.getCell(5)));
            stage.setStatus("NOT_STARTED");
            if (stage.getName() != null && !stage.getName().isEmpty()) {
                versionStageService.save(stage);
            }
        }

        wb.close();
        return R.ok(version);
    }

    private String getCellString(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> cell.toString().trim();
        };
    }
}
