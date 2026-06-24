package com.livekick.service.football;

import com.livekick.dto.football.PlayerDto;
import com.livekick.exception.ResourceNotFoundException;
import com.livekick.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;

    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    public List<PlayerDto> getPlayers(Long teamId) {
        return playerRepository.findAll(teamId);
    }

    public PlayerDto getPlayer(Long id) {
        return playerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found"));
    }
}
