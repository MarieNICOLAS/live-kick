package com.livekick.controller;

import com.livekick.dto.football.CompetitionGroupDto;
import com.livekick.service.football.FootballDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/groups")
public class CompetitionGroupController {

    private final FootballDataService footballDataService;

    public CompetitionGroupController(FootballDataService footballDataService) {
        this.footballDataService = footballDataService;
    }

    @GetMapping
    public List<CompetitionGroupDto> getGroups() {
        return footballDataService.getGroups();
    }

    @GetMapping("/{code}")
    public CompetitionGroupDto getGroup(@PathVariable String code) {
        return footballDataService.getGroup(code);
    }
}