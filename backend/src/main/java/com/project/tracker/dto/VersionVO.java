package com.project.tracker.dto;

import com.project.tracker.entity.Version;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class VersionVO extends Version {
    private List<RequirementVO> requirements;
    private List<StageVO> stages;
}
