package com.livekick.controller;

import com.livekick.dto.football.TeamComparisonDto;
import com.livekick.dto.football.TeamDto;
import com.livekick.dto.football.TeamStatisticsDto;
import com.livekick.service.football.FootballDataService;
import com.livekick.service.football.TeamStatisticsService;
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
    private final TeamStatisticsService teamStatisticsService;

    public TeamController(FootballDataService footballDataService, TeamStatisticsService teamStatisticsService) {
        this.footballDataService = footballDataService;
        this.teamStatisticsService = teamStatisticsService;
    }

    @GetMapping
    public List<TeamDto> getTeams(@RequestParam(required = false) String group) {
        return footballDataService.getTeams(group);
    }

    @GetMapping("/compare")
    public TeamComparisonDto compareTeams(
            @RequestParam Long firstTeamId,
            @RequestParam Long secondTeamId
    ) {
        return teamStatisticsService.compareTeams(firstTeamId, secondTeamId);
    }

    @GetMapping("/{id}/statistics")
    public TeamStatisticsDto getTeamStatistics(@PathVariable Long id) {
        return teamStatisticsService.getTeamStatistics(id);
    }

    @GetMapping("/{id}")
    public TeamDto getTeam(@PathVariable Long id) {
        return footballDataService.getTeam(id);
    }
}
