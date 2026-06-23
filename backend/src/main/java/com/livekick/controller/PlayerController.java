package com.livekick.controller;

import com.livekick.dto.football.PlayerDto;
import com.livekick.service.football.PlayerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public List<PlayerDto> getPlayers(@RequestParam(required = false) Long teamId) {
        return playerService.getPlayers(teamId);
    }

    @GetMapping("/{id}")
    public PlayerDto getPlayer(@PathVariable Long id) {
        return playerService.getPlayer(id);
    }
}
