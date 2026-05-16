package com.project.tracker.dto;

import lombok.Data;

@Data
public class RequirementVO {
    private Long id;
    private Long versionId;
    private String name;
    private String reqNumber;
    private String assignee;
}
