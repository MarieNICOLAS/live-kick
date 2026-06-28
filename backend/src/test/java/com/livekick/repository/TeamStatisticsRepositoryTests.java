package com.livekick.repository;

import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.TeamDto;
import com.livekick.dto.football.TeamSummaryDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class TeamStatisticsRepositoryTests {

    @Autowired
    private FootballCacheRepository footballCacheRepository;

    @Autowired
    private TeamStatisticsRepository teamStatisticsRepository;

    @Test
    void findsOnlyFinishedMatchesPlayedByTeam() {
        TeamDto france = new TeamDto(9001L, "France", "FRA", "France", "/flags/fra.png", "A");
        TeamDto brazil = new TeamDto(9002L, "Brazil", "BRA", "Brazil", "/flags/bra.png", "A");
        TeamDto japan = new TeamDto(9003L, "Japan", "JPN", "Japan", "/flags/jpn.png", "B");

        footballCacheRepository.saveTeams(List.of(france, brazil, japan));

        FootballMatchDto finishedFranceMatch = new FootballMatchDto(
                9101L,
                LocalDateTime.of(2026, 6, 20, 18, 0),
                "FINISHED",
                "GROUP_STAGE",
                "group",
                "A",
                1,
                2,
                1,
                null,
                summary(france),
                summary(brazil),
                null
        );

        FootballMatchDto scheduledFranceMatch = new FootballMatchDto(
                9102L,
                LocalDateTime.of(2026, 6, 24, 18, 0),
                "SCHEDULED",
                "GROUP_STAGE",
                "group",
                "A",
                2,
                null,
                null,
                null,
                summary(france),
                summary(japan),
                null
        );

        FootballMatchDto finishedOtherMatch = new FootballMatchDto(
                9103L,
                LocalDateTime.of(2026, 6, 25, 18, 0),
                "FINISHED",
                "GROUP_STAGE",
                "group",
                "B",
                2,
                1,
                1,
                null,
                summary(brazil),
                summary(japan),
                null
        );

        footballCacheRepository.saveMatches(List.of(
                finishedFranceMatch,
                scheduledFranceMatch,
                finishedOtherMatch
        ));

        List<FootballMatchDto> matches = teamStatisticsRepository.findFinishedMatchesByTeamId(france.id());

        assertThat(matches)
                .extracting(FootballMatchDto::id)
                .contains(9101L)
                .doesNotContain(9102L, 9103L);

        assertThat(matches).singleElement()
                .satisfies(match -> {
                    assertThat(match.status()).isEqualTo("FINISHED");
                    assertThat(match.homeTeam().fifaCode()).isEqualTo("FRA");
                    assertThat(match.awayTeam().fifaCode()).isEqualTo("BRA");
                });
    }

    private TeamSummaryDto summary(TeamDto team) {
        return new TeamSummaryDto(
                team.id(),
                team.name(),
                team.fifaCode(),
                team.flagUrl()
        );
    }
}
