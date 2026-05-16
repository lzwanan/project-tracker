package com.project.tracker.dto;

import lombok.Data;

@Data
public class BackupProgress {
    private String taskId;
    private String type;
    private int totalTables;
    private int doneTables;
    private String currentTable;
    private int percent;
    private String status;
    private String filename;
    private long startTime;
}
