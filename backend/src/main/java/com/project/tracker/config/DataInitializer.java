package com.project.tracker.config;

import com.project.tracker.entity.Personnel;
import com.project.tracker.mapper.PersonnelMapper;
import com.project.tracker.service.PasswordUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final PersonnelMapper personnelMapper;
    private final PasswordUtil passwordUtil;

    @Override
    public void run(String... args) {
        var list = personnelMapper.selectList(null);
        for (Personnel p : list) {
            if (p.getPassword() == null || p.getPassword().isEmpty()) {
                if ("admin".equals(p.getEmployeeId())) {
                    p.setPassword(passwordUtil.hash("admin"));
                    p.setFirstLogin(false);
                } else if ("guest".equals(p.getEmployeeId())) {
                    p.setPassword(passwordUtil.hash("guest"));
                    p.setFirstLogin(false);
                } else {
                    p.setPassword(passwordUtil.hash("123456"));
                    p.setFirstLogin(true);
                }
                personnelMapper.updateById(p);
            }
        }
    }
}
