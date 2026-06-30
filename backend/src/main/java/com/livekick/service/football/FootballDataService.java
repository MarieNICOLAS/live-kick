package com.livekick.service.football;

import com.livekick.dto.football.CompetitionGroupDto;
import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.FootballMatchLiveDto;
import com.livekick.dto.football.StadiumDto;
import com.livekick.dto.football.TeamDto;
import com.livekick.exception.ResourceNotFoundException;
import com.livekick.exception.ExternalServiceException;
import com.livekick.integration.footballapi.WorldCup2026Client;
import com.livekick.mapper.FrenchFootballLabelMapper;
import com.livekick.mapper.WorldCup2026Mapper;
import com.livekick.repository.FootballCacheRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class FootballDataService {

    private final WorldCup2026Client worldCup2026Client;
    private final WorldCup2026Mapper mapper;
    private final FrenchFootballLabelMapper labelMapper;
    private final FootballCacheRepository cacheRepository;

    public FootballDataService(
            WorldCup2026Client worldCup2026Client,
            WorldCup2026Mapper mapper,
            FrenchFootballLabelMapper labelMapper,
            FootballCacheRepository cacheRepository
    ) {
        this.worldCup2026Client = worldCup2026Client;
        this.mapper = mapper;
        this.labelMapper = labelMapper;
        this.cacheRepository = cacheRepository;
    }

    public List<TeamDto> getTeams(String groupCode) {
        List<TeamDto> teams;
        try {
            List<TeamDto> freshTeams = worldCup2026Client.getTeams().stream()
                    .map(mapper::toTeamDto)
                    .toList();
            if (!freshTeams.isEmpty()) {
                cacheRepository.saveTeams(freshTeams);
            }
            teams = freshTeams.isEmpty() ? cacheRepository.findTeams() : freshTeams;
        } catch (ExternalServiceException exception) {
            teams = cacheRepository.findTeams();
            if (teams.isEmpty()) {
                throw exception;
            }
        }

        return teams.stream()
                .filter(team -> groupCode == null || equalsIgnoreCase(team.groupCode(), groupCode))
                .map(labelMapper::localize)
                .sorted(Comparator.comparing(TeamDto::name, Comparator.nullsLast(String::compareToIgnoreCase)))
                .toList();
    }

    public TeamDto getTeam(Long id) {
        return getTeams(null).stream()
                .filter(team -> id.equals(team.id()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
    }

    public List<FootballMatchDto> getMatches(String groupCode, String phase, String status) {
        Map<Long, TeamDto> teamsById = getTeamsById();
        List<FootballMatchDto> matches;
        try {
            List<FootballMatchDto> freshMatches = worldCup2026Client.getGames().stream()
                    .map(game -> mapper.toFootballMatchDto(game, teamsById))
                    .toList();
            if (!freshMatches.isEmpty()) {
                cacheRepository.saveMatches(freshMatches);
            }
            matches = freshMatches.isEmpty() ? cacheRepository.findMatches() : freshMatches;
        } catch (ExternalServiceException exception) {
            matches = cacheRepository.findMatches();
            if (matches.isEmpty()) {
                throw exception;
            }
        }

        return matches.stream()
                .filter(match -> groupCode == null || equalsIgnoreCase(match.groupCode(), groupCode))
                .filter(match -> phase == null || equalsIgnoreCase(match.phase(), phase) || equalsIgnoreCase(match.phaseType(), phase))
                .filter(match -> status == null || equalsIgnoreCase(match.status(), status))
                .map(labelMapper::localize)
                .sorted(Comparator.comparing(FootballMatchDto::id, Comparator.nullsLast(Long::compareTo)))
                .toList();
    }

    public FootballMatchDto getMatch(Long id) {
        return getMatches(null, null, null).stream()
                .filter(match -> id.equals(match.id()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Football match not found"));
    }

    public FootballMatchLiveDto getMatchLiveState(Long id) {
        return mapper.toFootballMatchLiveDto(getMatch(id));
    }

    public List<CompetitionGroupDto> getGroups() {
        Map<Long, TeamDto> teamsById = getTeamsById();
        List<CompetitionGroupDto> groups;
        try {
            List<CompetitionGroupDto> freshGroups = worldCup2026Client.getGroups().stream()
                    .map(group -> mapper.toCompetitionGroupDto(group, teamsById))
                    .toList();
            if (!freshGroups.isEmpty()) {
                cacheRepository.saveGroups(freshGroups);
            }
            groups = freshGroups.isEmpty() ? cacheRepository.findGroups() : freshGroups;
        } catch (ExternalServiceException exception) {
            groups = cacheRepository.findGroups();
            if (groups.isEmpty()) {
                throw exception;
            }
        }

        return groups.stream()
                .map(labelMapper::localize)
                .sorted(Comparator.comparing(CompetitionGroupDto::displayOrder, Comparator.nullsLast(Integer::compareTo)))
                .toList();
    }

    public CompetitionGroupDto getGroup(String code) {
        return getGroups().stream()
                .filter(group -> equalsIgnoreCase(group.code(), code))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Competition group not found"));
    }

    public List<StadiumDto> getStadiums() {
        List<StadiumDto> stadiums;
        try {
            List<StadiumDto> freshStadiums = worldCup2026Client.getStadiums().stream()
                    .map(mapper::toStadiumDto)
                    .toList();
            if (!freshStadiums.isEmpty()) {
                cacheRepository.saveStadiums(freshStadiums);
            }
            stadiums = freshStadiums.isEmpty() ? cacheRepository.findStadiums() : freshStadiums;
        } catch (ExternalServiceException exception) {
            stadiums = cacheRepository.findStadiums();
            if (stadiums.isEmpty()) {
                throw exception;
            }
        }

        return stadiums.stream()
                .map(labelMapper::localize)
                .sorted(Comparator.comparing(StadiumDto::id, Comparator.nullsLast(Long::compareTo)))
                .toList();
    }

    public StadiumDto getStadium(Long id) {
        return getStadiums().stream()
                .filter(stadium -> id.equals(stadium.id()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Stadium not found"));
    }

    private Map<Long, TeamDto> getTeamsById() {
        return getTeams(null).stream()
                .filter(team -> team.id() != null)
                .collect(Collectors.toMap(TeamDto::id, Function.identity(), (first, second) -> first));
    }

    private boolean equalsIgnoreCase(String currentValue, String expectedValue) {
        return Optional.ofNullable(currentValue).orElse("").toLowerCase(Locale.ROOT)
                .equals(Optional.ofNullable(expectedValue).orElse("").toLowerCase(Locale.ROOT));
    }
}
