package com.project.tracker.dto;

import java.util.List;
import lombok.Data;

@Data
public class StageVO {
    private Long id;
    private Long versionId;
    private Long parentId;
    private String name;
    private Integer orderSeq;
    private String status;
    private String dueDate;
    private String assignee;
    private List<StageVO> children;
}
