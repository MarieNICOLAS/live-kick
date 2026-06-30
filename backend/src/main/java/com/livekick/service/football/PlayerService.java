package com.livekick.service.football;

import com.livekick.dto.football.PlayerDto;
import com.livekick.exception.ResourceNotFoundException;
import com.livekick.mapper.FrenchFootballLabelMapper;
import com.livekick.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final FrenchFootballLabelMapper labelMapper;

    public PlayerService(PlayerRepository playerRepository, FrenchFootballLabelMapper labelMapper) {
        this.playerRepository = playerRepository;
        this.labelMapper = labelMapper;
    }

    public List<PlayerDto> getPlayers(Long teamId) {
        return playerRepository.findAll(teamId).stream()
                .map(labelMapper::localize)
                .toList();
    }

    public PlayerDto getPlayer(Long id) {
        return labelMapper.localize(playerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found")));
    }
}
