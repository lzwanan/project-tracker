package com.project.tracker.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class BackupScheduler {

    private final BackupService backupService;

    @Scheduled(cron = "${system.backup.cron:0 0 0,12 * * *}")
    public void scheduledBackup() {
        String taskId = UUID.randomUUID().toString();
        log.info("Scheduled backup triggered, taskId: {}", taskId);
        backupService.startBackup(taskId, "auto");
    }
}
