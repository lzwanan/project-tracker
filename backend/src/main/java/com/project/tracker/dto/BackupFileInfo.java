package com.project.tracker.dto;

import lombok.Data;

@Data
public class BackupFileInfo {
    private String name;
    private long size;
    private String time;
    private String source;
}
