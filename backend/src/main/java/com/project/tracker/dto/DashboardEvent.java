package com.project.tracker.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class DashboardEvent {
    private Long id;
    private String title;
    private String type;
    private String subtype;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String color;
    private String owner;
    private String assignee;
    private String link;
}
