package com.livekick.service.football;

import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.TeamComparisonDto;
import com.livekick.dto.football.TeamDto;
import com.livekick.dto.football.TeamFormMatchDto;
import com.livekick.dto.football.TeamStatisticsDto;
import com.livekick.dto.football.TeamSummaryDto;
import com.livekick.repository.TeamStatisticsRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeamStatisticsService {

    private static final int RECENT_FORM_LIMIT = 5;

    private final TeamStatisticsRepository teamStatisticsRepository;
    private final FootballDataService footballDataService;

    public TeamStatisticsService(
            TeamStatisticsRepository teamStatisticsRepository,
            FootballDataService footballDataService
    ) {
        this.teamStatisticsRepository = teamStatisticsRepository;
        this.footballDataService = footballDataService;
    }

    public TeamStatisticsDto getTeamStatistics(Long teamId) {
        TeamDto team = footballDataService.getTeam(teamId);
        TeamSummaryDto teamSummary = toTeamSummary(team);

        List<FootballMatchDto> matches = teamStatisticsRepository.findFinishedMatchesByTeamId(teamId);

        int matchesPlayed = matches.size();
        int wins = 0;
        int draws = 0;
        int losses = 0;
        int goalsFor = 0;
        int goalsAgainst = 0;

        for (FootballMatchDto match : matches) {
            int teamScore = getTeamScore(match, teamId);
            int opponentScore = getOpponentScore(match, teamId);

            goalsFor += teamScore;
            goalsAgainst += opponentScore;

            if (teamScore > opponentScore) {
                wins++;
            } else if (teamScore == opponentScore) {
                draws++;
            } else {
                losses++;
            }
        }

        int goalDifference = goalsFor - goalsAgainst;
        double winRate = calculateRate(wins, matchesPlayed);
        double averageGoalsFor = calculateAverage(goalsFor, matchesPlayed);
        double averageGoalsAgainst = calculateAverage(goalsAgainst, matchesPlayed);

        List<TeamFormMatchDto> recentForm = matches.stream()
                .limit(RECENT_FORM_LIMIT)
                .map(match -> toTeamFormMatch(match, teamId))
                .toList();

        return new TeamStatisticsDto(
                team.id(),
                teamSummary,
                matchesPlayed,
                wins,
                draws,
                losses,
                goalsFor,
                goalsAgainst,
                goalDifference,
                winRate,
                averageGoalsFor,
                averageGoalsAgainst,
                recentForm
        );
    }

    public TeamComparisonDto compareTeams(Long firstTeamId, Long secondTeamId) {
        if (firstTeamId.equals(secondTeamId)) {
            throw new IllegalArgumentException("Teams must be different");
        }

        return new TeamComparisonDto(
                getTeamStatistics(firstTeamId),
                getTeamStatistics(secondTeamId)
        );
    }

    private TeamFormMatchDto toTeamFormMatch(FootballMatchDto match, Long teamId) {
        int teamScore = getTeamScore(match, teamId);
        int opponentScore = getOpponentScore(match, teamId);

        return new TeamFormMatchDto(
                match.id(),
                match.matchDate(),
                getOpponent(match, teamId),
                isHomeTeam(match, teamId),
                teamScore,
                opponentScore,
                getResult(teamScore, opponentScore)
        );
    }

    private TeamSummaryDto toTeamSummary(TeamDto team) {
        return new TeamSummaryDto(
                team.id(),
                team.name(),
                team.fifaCode(),
                team.flagUrl()
        );
    }

    private TeamSummaryDto getOpponent(FootballMatchDto match, Long teamId) {
        if (isHomeTeam(match, teamId)) {
            return match.awayTeam();
        }

        return match.homeTeam();
    }

    private int getTeamScore(FootballMatchDto match, Long teamId) {
        if (isHomeTeam(match, teamId)) {
            return match.homeScore();
        }

        return match.awayScore();
    }

    private int getOpponentScore(FootballMatchDto match, Long teamId) {
        if (isHomeTeam(match, teamId)) {
            return match.awayScore();
        }

        return match.homeScore();
    }

    private boolean isHomeTeam(FootballMatchDto match, Long teamId) {
        return match.homeTeam() != null && teamId.equals(match.homeTeam().id());
    }

    private String getResult(int teamScore, int opponentScore) {
        if (teamScore > opponentScore) {
            return "WIN";
        }

        if (teamScore < opponentScore) {
            return "LOSS";
        }

        return "DRAW";
    }

    private double calculateRate(int value, int total) {
        if (total == 0) {
            return 0.0;
        }

        return Math.round((value * 100.0 / total) * 100.0) / 100.0;
    }

    private double calculateAverage(int value, int total) {
        if (total == 0) {
            return 0.0;
        }

        return Math.round((value * 1.0 / total) * 100.0) / 100.0;
    }
}