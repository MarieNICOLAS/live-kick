package com.livekick.controller;

import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.FootballMatchLiveDto;
import com.livekick.service.football.FootballDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/matches")
public class FootballMatchController {

    private final FootballDataService footballDataService;

    public FootballMatchController(FootballDataService footballDataService) {
        this.footballDataService = footballDataService;
    }

    @GetMapping
    public List<FootballMatchDto> getMatches(
            @RequestParam(required = false) String group,
            @RequestParam(required = false) String phase,
            @RequestParam(required = false) String status
    ) {
        return footballDataService.getMatches(group, phase, status);
    }

    @GetMapping("/{id}")
    public FootballMatchDto getMatch(@PathVariable Long id) {
        return footballDataService.getMatch(id);
    }

    @GetMapping("/{id}/live")
    public FootballMatchLiveDto getMatchLiveState(@PathVariable Long id) {
        return footballDataService.getMatchLiveState(id);
    }
}