package com.livekick.service.football;

import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.TeamComparisonDto;
import com.livekick.dto.football.TeamDto;
import com.livekick.dto.football.TeamStatisticsDto;
import com.livekick.dto.football.TeamSummaryDto;
import com.livekick.mapper.FrenchFootballLabelMapper;
import com.livekick.repository.TeamStatisticsRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TeamStatisticsServiceTests {

    private final TeamStatisticsRepository teamStatisticsRepository = mock(TeamStatisticsRepository.class);
    private final FootballDataService footballDataService = mock(FootballDataService.class);
    private final FrenchFootballLabelMapper labelMapper = new FrenchFootballLabelMapper();

    private final TeamStatisticsService service = new TeamStatisticsService(
            teamStatisticsRepository,
            footballDataService,
            labelMapper
    );

    @Test
    void calculatesTeamStatisticsFromFinishedMatches() {
        Long franceId = 1L;
        TeamDto france = new TeamDto(franceId, "France", "FRA", "France", "/flags/fra.png", "A");

        TeamSummaryDto franceSummary = new TeamSummaryDto(franceId, "France", "FRA", "/flags/fra.png");
        TeamSummaryDto brazilSummary = new TeamSummaryDto(2L, "Brazil", "BRA", "/flags/bra.png");
        TeamSummaryDto japanSummary = new TeamSummaryDto(3L, "Japan", "JPN", "/flags/jpn.png");

        FootballMatchDto win = new FootballMatchDto(
                100L,
                LocalDateTime.of(2026, 6, 20, 18, 0),
                "FINISHED",
                "GROUP_STAGE",
                "group",
                "A",
                1,
                2,
                1,
                null,
                franceSummary,
                brazilSummary,
                10L
        );

        FootballMatchDto draw = new FootballMatchDto(
                101L,
                LocalDateTime.of(2026, 6, 24, 18, 0),
                "FINISHED",
                "GROUP_STAGE",
                "group",
                "A",
                2,
                1,
                1,
                null,
                japanSummary,
                franceSummary,
                11L
        );

        when(footballDataService.getTeam(franceId)).thenReturn(france);
        when(teamStatisticsRepository.findFinishedMatchesByTeamId(franceId)).thenReturn(List.of(win, draw));

        TeamStatisticsDto statistics = service.getTeamStatistics(franceId);

        assertThat(statistics.team().name()).isEqualTo("France");
        assertThat(statistics.matchesPlayed()).isEqualTo(2);
        assertThat(statistics.wins()).isEqualTo(1);
        assertThat(statistics.draws()).isEqualTo(1);
        assertThat(statistics.losses()).isEqualTo(0);
        assertThat(statistics.goalsFor()).isEqualTo(3);
        assertThat(statistics.goalsAgainst()).isEqualTo(2);
        assertThat(statistics.goalDifference()).isEqualTo(1);
        assertThat(statistics.winRate()).isEqualTo(50.0);
        assertThat(statistics.averageGoalsFor()).isEqualTo(1.5);
        assertThat(statistics.averageGoalsAgainst()).isEqualTo(1.0);
        assertThat(statistics.recentForm()).hasSize(2);
        assertThat(statistics.recentForm().get(0).result()).isEqualTo("WIN");
        assertThat(statistics.recentForm().get(1).result()).isEqualTo("DRAW");
    }

    @Test
    void comparesTwoDifferentTeams() {
        Long franceId = 1L;
        Long brazilId = 2L;

        when(footballDataService.getTeam(franceId))
                .thenReturn(new TeamDto(franceId, "France", "FRA", "France", "/flags/fra.png", "A"));
        when(footballDataService.getTeam(brazilId))
                .thenReturn(new TeamDto(brazilId, "Brazil", "BRA", "Brazil", "/flags/bra.png", "A"));
        when(teamStatisticsRepository.findFinishedMatchesByTeamId(franceId)).thenReturn(List.of());
        when(teamStatisticsRepository.findFinishedMatchesByTeamId(brazilId)).thenReturn(List.of());

        TeamComparisonDto comparison = service.compareTeams(franceId, brazilId);

        assertThat(comparison.firstTeamStatistics().team().name()).isEqualTo("France");
        assertThat(comparison.secondTeamStatistics().team().name()).isEqualTo("Brésil");
    }

    @Test
    void rejectsComparisonWithSameTeam() {
        assertThatThrownBy(() -> service.compareTeams(1L, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Teams must be different");
    }
}
