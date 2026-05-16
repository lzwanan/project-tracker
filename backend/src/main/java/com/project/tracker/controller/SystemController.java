package com.project.tracker.controller;

import com.project.tracker.dto.BackupFileInfo;
import com.project.tracker.dto.BackupProgress;
import com.project.tracker.dto.R;
import com.project.tracker.service.BackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.FileInputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
public class SystemController {

    private final BackupService backupService;

    @PostMapping("/backup")
    public R<String> backup() {
        String taskId = UUID.randomUUID().toString().substring(0, 8);
        backupService.startBackup(taskId, "manual");
        return R.ok(taskId);
    }

    @GetMapping("/backup/progress/{taskId}")
    public R<BackupProgress> backupProgress(@PathVariable String taskId) {
        return R.ok(backupService.getProgress(taskId));
    }

    @GetMapping("/backups")
    public R<List<BackupFileInfo>> backups() {
        return R.ok(backupService.listBackups());
    }

    @GetMapping("/backups/download/{filename}")
    public ResponseEntity<InputStreamResource> downloadBackup(@PathVariable String filename) {
        var path = backupService.downloadBackup(filename);
        try {
            FileInputStream fis = new FileInputStream(path.toFile());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=" + URLEncoder.encode(filename, StandardCharsets.UTF_8))
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(new InputStreamResource(fis));
        } catch (Exception e) {
            throw new RuntimeException("Download failed", e);
        }
    }

    @PostMapping("/backups/{filename}/restore")
    public R<Map<String, String>> restore(@PathVariable String filename) {
        String taskId = UUID.randomUUID().toString();
        backupService.startRestore(taskId, filename);
        return R.ok(Map.of("taskId", taskId));
    }

    @GetMapping("/restore/progress/{taskId}")
    public R<BackupProgress> restoreProgress(@PathVariable String taskId) {
        return R.ok(backupService.getProgress(taskId));
    }
}
