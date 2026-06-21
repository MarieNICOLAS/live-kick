package com.livekick.controller;

import com.livekick.dto.football.TeamDto;
import com.livekick.service.football.FootballDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teams")
public class TeamController {

    private final FootballDataService footballDataService;

    public TeamController(FootballDataService footballDataService) {
        this.footballDataService = footballDataService;
    }

    @GetMapping
    public List<TeamDto> getTeams(@RequestParam(required = false) String group) {
        return footballDataService.getTeams(group);
    }

    @GetMapping("/{id}")
    public TeamDto getTeam(@PathVariable Long id) {
        return footballDataService.getTeam(id);
    }
}