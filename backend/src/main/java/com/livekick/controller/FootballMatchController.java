package com.livekick.controller;

import com.livekick.dto.ai.PredictionDto;
import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.FootballMatchLiveDto;
import com.livekick.service.ai.PredictionService;
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
    private final PredictionService predictionService;

    public FootballMatchController(
            FootballDataService footballDataService,
            PredictionService predictionService
    ) {
        this.footballDataService = footballDataService;
        this.predictionService = predictionService;
    }

    @GetMapping
    public List<FootballMatchDto> getMatches(
            @RequestParam(required = false) String group,
            @RequestParam(required = false) String phase,
            @RequestParam(required = false) String status
    ) {
        return footballDataService.getMatches(group, phase, status);
    }

    @GetMapping("/predictions")
    public List<PredictionDto> getKnownMatchPredictions() {
        return predictionService.getKnownMatchPredictions();
    }

    @GetMapping("/predictions/upcoming")
    public List<PredictionDto> getUpcomingKnownMatchPredictions() {
        return predictionService.getUpcomingKnownMatchPredictions();
    }

    @GetMapping("/{id}/live")
    public FootballMatchLiveDto getMatchLiveState(@PathVariable Long id) {
        return footballDataService.getMatchLiveState(id);
    }

    @GetMapping("/{id}/prediction")
    public PredictionDto getMatchPrediction(@PathVariable Long id) {
        return predictionService.getPrediction(id);
    }

    @GetMapping("/{id}")
    public FootballMatchDto getMatch(@PathVariable Long id) {
        return footballDataService.getMatch(id);
    }
}
