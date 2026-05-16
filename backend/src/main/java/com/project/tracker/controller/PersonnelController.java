package com.project.tracker.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.project.tracker.dto.PersonnelVO;
import com.project.tracker.dto.R;
import com.project.tracker.entity.Personnel;
import com.project.tracker.entity.SysRole;
import com.project.tracker.service.PasswordUtil;
import com.project.tracker.service.PersonnelService;
import com.project.tracker.service.SysRoleService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/personnel")
@RequiredArgsConstructor
public class PersonnelController {

    private final PersonnelService personnelService;
    private final SysRoleService sysRoleService;
    private final PasswordUtil passwordUtil;

    @GetMapping
    public R<Page<PersonnelVO>> list(@RequestParam(defaultValue = "1") int page,
                                      @RequestParam(defaultValue = "10") int size,
                                      @RequestParam(required = false) String keyword) {
        return R.ok(personnelService.pageWithRoles(page, size, keyword));
    }

    @GetMapping("/all")
    public R<List<Personnel>> all() {
        return R.ok(personnelService.list());
    }

    @GetMapping("/with-roles")
    public R<List<PersonnelVO>> withRoles() {
        List<Personnel> list = personnelService.list();
        List<PersonnelVO> vos = new ArrayList<>();
        for (Personnel p : list) {
            PersonnelVO vo = new PersonnelVO();
            org.springframework.beans.BeanUtils.copyProperties(p, vo);
            vo.setRoles(personnelService.getRolesByPersonnelId(p.getId()));
            vos.add(vo);
        }
        return R.ok(vos);
    }

    @GetMapping("/export/template")
    public void exportTemplate(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition",
                "attachment; filename=" + URLEncoder.encode("人员导入模板.xlsx", StandardCharsets.UTF_8));
        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("人员");
        Row header = sheet.createRow(0);
        String[] cols = {"工号", "姓名", "邮箱", "角色"};
        for (int i = 0; i < cols.length; i++) {
            header.createCell(i).setCellValue(cols[i]);
        }
        wb.write(response.getOutputStream());
        wb.close();
    }

    @PostMapping("/import")
    public R<Integer> importPersonnel(@RequestParam("file") MultipartFile file) throws IOException {
        Workbook wb = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = wb.getSheetAt(0);
        int count = 0;
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            String employeeId = getCellString(row.getCell(0));
            String name = getCellString(row.getCell(1));
            String email = getCellString(row.getCell(2));
            String roleCodes = getCellString(row.getCell(3));
            if (employeeId == null || employeeId.isEmpty()) continue;

            List<Personnel> existing = personnelService.list(
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Personnel>()
                            .eq(Personnel::getEmployeeId, employeeId));
            Personnel p;
            if (!existing.isEmpty()) {
                p = existing.get(0);
            } else {
                p = new Personnel();
                p.setEmployeeId(employeeId);
                p.setPassword(passwordUtil.hash("123456"));
                p.setFirstLogin(true);
            }
            p.setName(name != null ? name : "");
            p.setEmail(email != null ? email : "");
            personnelService.saveOrUpdate(p);

            if (roleCodes != null && !roleCodes.isEmpty()) {
                String[] codes = roleCodes.split("[,;]");
                List<Long> roleIds = new ArrayList<>();
                for (String code : codes) {
                    List<SysRole> roles = sysRoleService.list(
                            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysRole>()
                                    .eq(SysRole::getCode, code.trim()));
                    if (!roles.isEmpty()) {
                        roleIds.add(roles.get(0).getId());
                    }
                }
                if (!roleIds.isEmpty()) {
                    personnelService.assignRoles(p.getId(), roleIds);
                }
            }
            count++;
        }
        wb.close();
        return R.ok(count);
    }

    @PostMapping
    public R<Personnel> create(@RequestBody Personnel personnel) {
        personnel.setPassword(passwordUtil.hash("123456"));
        personnel.setFirstLogin(true);
        personnelService.save(personnel);
        return R.ok(personnel);
    }

    @PutMapping("/{id}")
    public R<Personnel> update(@PathVariable Long id, @RequestBody Personnel personnel) {
        personnel.setId(id);
        personnelService.updateById(personnel);
        return R.ok(personnel);
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        personnelService.removeById(id);
        return R.ok();
    }

    @GetMapping("/roles/{id}")
    public R<List<SysRole>> roles(@PathVariable Long id) {
        return R.ok(personnelService.getRolesByPersonnelId(id));
    }

    @PutMapping("/assign-roles/{id}")
    public R<Void> assignRoles(@PathVariable Long id, @RequestBody Map<String, List<Long>> body) {
        personnelService.assignRoles(id, body.get("roleIds"));
        return R.ok();
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
