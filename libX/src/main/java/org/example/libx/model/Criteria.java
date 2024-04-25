package org.example.libx.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Criteria {
    Map<String, List<String>> criteria;

    @Override
    public String toString() {
        return "Criteria{" +
                "criteria=" + criteria +
                '}';
    }
}