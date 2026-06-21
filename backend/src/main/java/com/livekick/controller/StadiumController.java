package com.livekick.controller;

import com.livekick.dto.football.StadiumDto;
import com.livekick.service.football.FootballDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stadiums")
public class StadiumController {

    private final FootballDataService footballDataService;

    public StadiumController(FootballDataService footballDataService) {
        this.footballDataService = footballDataService;
    }

    @GetMapping
    public List<StadiumDto> getStadiums() {
        return footballDataService.getStadiums();
    }

    @GetMapping("/{id}")
    public StadiumDto getStadium(@PathVariable Long id) {
        return footballDataService.getStadium(id);
    }
}