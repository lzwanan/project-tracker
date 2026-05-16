package com.project.tracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.tracker.dto.BackupFileInfo;
import com.project.tracker.dto.BackupProgress;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class BackupService {

    private final DataSource dataSource;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, BackupProgress> progressMap = new ConcurrentHashMap<>();

    private static final List<String> EXCLUDED_TABLES = List.of("access_log");

    @Value("${system.backup.dir:./backups}")
    private String backupDir;

    @Async
    public void startBackup(String taskId, String source) {
        BackupProgress progress = new BackupProgress();
        progress.setTaskId(taskId);
        progress.setType("backup");
        progress.setStatus("running");
        progress.setStartTime(System.currentTimeMillis());
        progressMap.put(taskId, progress);

        try {
            Path dir = Paths.get(backupDir);
            Files.createDirectories(dir);

            List<String> tableNames = getTableNames();
            progress.setTotalTables(tableNames.size());
            progress.setDoneTables(0);

            Map<String, List<Map<String, Object>>> data = new HashMap<>();

            for (int i = 0; i < tableNames.size(); i++) {
                String table = tableNames.get(i);
                progress.setCurrentTable(table);
                progress.setPercent((int) ((double) i / tableNames.size() * 100));
                List<Map<String, Object>> rows = queryTable(table);
                data.put(table, rows);
                progress.setDoneTables(i + 1);
            }

            String filename = "tracker-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + "-" + source + ".json";
            Path file = dir.resolve(filename);
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), data);

            progress.setPercent(100);
            progress.setStatus("completed");
            progress.setFilename(filename);
            progress.setCurrentTable(null);
            log.info("Backup completed: taskId={}, file={}, tables={}, rows={}",
                    taskId, filename, data.size(),
                    data.values().stream().mapToInt(List::size).sum());
        } catch (Exception e) {
            log.error("Backup failed: taskId={}", taskId, e);
            progress.setStatus("failed");
        }
    }

    @Async
    public void startRestore(String taskId, String filename) {
        BackupProgress progress = new BackupProgress();
        progress.setTaskId(taskId);
        progress.setType("restore");
        progress.setStatus("running");
        progress.setStartTime(System.currentTimeMillis());
        progress.setFilename(filename);
        progressMap.put(taskId, progress);

        try {
            Path file = Paths.get(backupDir).resolve(filename);
            if (!Files.exists(file)) {
                throw new RuntimeException("Backup file not found: " + filename);
            }

            @SuppressWarnings("unchecked")
            Map<String, List<Map<String, Object>>> data = objectMapper.readValue(file.toFile(), HashMap.class);
            List<String> tables = new ArrayList<>(data.keySet());
            progress.setTotalTables(tables.size());
            progress.setDoneTables(0);

            try (Connection conn = dataSource.getConnection()) {
                conn.setAutoCommit(false);

                for (int i = 0; i < tables.size(); i++) {
                    String table = tables.get(i);
                    progress.setCurrentTable(table);
                    progress.setPercent((int) ((double) i / tables.size() * 100));

                    PreparedStatement deleteStmt = conn.prepareStatement("DELETE FROM " + table);
                    deleteStmt.executeUpdate();

                    List<Map<String, Object>> rows = data.get(table);
                    if (rows != null && !rows.isEmpty()) {
                        for (Map<String, Object> row : rows) {
                            buildInsert(conn, table, row).executeUpdate();
                        }
                    }

                    progress.setDoneTables(i + 1);
                }
                conn.commit();
            }

            progress.setPercent(100);
            progress.setStatus("completed");
            progress.setCurrentTable(null);
            log.info("Restore completed: taskId={}, file={}", taskId, filename);
        } catch (Exception e) {
            log.error("Restore failed: taskId={}", taskId, e);
            progress.setStatus("failed");
        }
    }

    public BackupProgress getProgress(String taskId) {
        return progressMap.get(taskId);
    }

    public List<BackupFileInfo> listBackups() {
        try {
            Path dir = Paths.get(backupDir);
            if (!Files.exists(dir)) {
                return List.of();
            }
            try (Stream<Path> stream = Files.list(dir)) {
                return stream
                        .filter(p -> p.toString().endsWith(".json"))
                        .map(p -> {
                            try {
                                BackupFileInfo info = new BackupFileInfo();
                                info.setName(p.getFileName().toString());
                                info.setSize(Files.size(p));
                                BasicFileAttributes attrs = Files.readAttributes(p, BasicFileAttributes.class);
                                info.setTime(LocalDateTime.ofInstant(
                                        Instant.ofEpochMilli(attrs.lastModifiedTime().toMillis()),
                                        ZoneId.systemDefault()
                                ).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                                return info;
                            } catch (Exception e) {
                                return null;
                            }
                        })
                        .filter(info -> info != null)
                        .sorted(Comparator.comparing(BackupFileInfo::getTime).reversed())
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.error("Failed to list backups", e);
            return List.of();
        }
    }

    public Path downloadBackup(String filename) {
        Path file = Paths.get(backupDir).resolve(filename);
        if (!Files.exists(file)) {
            throw new RuntimeException("Backup file not found: " + filename);
        }
        return file;
    }

    public void cleanupOldBackups(int days) {
        try {
            Path dir = Paths.get(backupDir);
            if (!Files.exists(dir)) {
                return;
            }
            long cutoff = System.currentTimeMillis() - (long) days * 24 * 60 * 60 * 1000;
            try (Stream<Path> stream = Files.list(dir)) {
                stream.filter(p -> p.toString().endsWith(".json"))
                        .forEach(p -> {
                            try {
                                BasicFileAttributes attrs = Files.readAttributes(p, BasicFileAttributes.class);
                                if (attrs.lastModifiedTime().toMillis() < cutoff) {
                                    Files.delete(p);
                                    log.info("Deleted old backup: {}", p.getFileName());
                                }
                            } catch (Exception e) {
                                log.warn("Failed to process file: {}", p, e);
                            }
                        });
            }
        } catch (Exception e) {
            log.error("Failed to cleanup old backups", e);
        }
    }

    private List<String> getTableNames() {
        List<String> tables = new ArrayList<>();
        try (Connection conn = dataSource.getConnection()) {
            ResultSet rs = conn.getMetaData().getTables(null, "PUBLIC", "%", new String[]{"TABLE"});
            while (rs.next()) {
                String name = rs.getString("TABLE_NAME");
                if (!"ACCESS_LOG".equalsIgnoreCase(name)) {
                    tables.add(name);
                }
            }
        } catch (Exception e) {
            log.error("Failed to get table names", e);
        }
        return tables;
    }

    private List<Map<String, Object>> queryTable(String tableName) {
        List<Map<String, Object>> rows = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM " + tableName);
             ResultSet rs = stmt.executeQuery()) {
            ResultSetMetaData meta = rs.getMetaData();
            int columnCount = meta.getColumnCount();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    row.put(meta.getColumnName(i), rs.getObject(i));
                }
                rows.add(row);
            }
        } catch (Exception e) {
            log.error("Failed to query table: {}", tableName, e);
        }
        return rows;
    }

    private PreparedStatement buildInsert(Connection conn, String tableName, Map<String, Object> row) throws Exception {
        if (row.isEmpty()) {
            return conn.prepareStatement("INSERT INTO " + tableName + " () VALUES ()");
        }
        List<String> columns = new ArrayList<>(row.keySet());
        String cols = String.join(", ", columns);
        String placeholders = columns.stream().map(c -> "?").collect(Collectors.joining(", "));
        String sql = "INSERT INTO " + tableName + " (" + cols + ") VALUES (" + placeholders + ")";
        PreparedStatement stmt = conn.prepareStatement(sql);
        for (int i = 0; i < columns.size(); i++) {
            stmt.setObject(i + 1, row.get(columns.get(i)));
        }
        return stmt;
    }
}
