package com.project.tracker.service;

import com.project.tracker.dto.StageVO;

import java.util.*;

public class StageTreeBuilder {

    public static List<StageVO> buildTree(List<StageVO> flatList) {
        Map<Long, StageVO> map = new LinkedHashMap<>();
        for (StageVO stage : flatList) {
            map.put(stage.getId(), stage);
            stage.setChildren(new ArrayList<>());
        }
        List<StageVO> roots = new ArrayList<>();
        for (StageVO stage : flatList) {
            if (stage.getParentId() != null && map.containsKey(stage.getParentId())) {
                map.get(stage.getParentId()).getChildren().add(stage);
            } else {
                roots.add(stage);
            }
        }
        return roots;
    }
}
