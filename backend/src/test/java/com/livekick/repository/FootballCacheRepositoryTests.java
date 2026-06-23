package com.livekick.repository;

import com.livekick.dto.ai.PredictionDto;
import com.livekick.dto.football.CompetitionGroupDto;
import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.GroupStandingDto;
import com.livekick.dto.football.PlayerDto;
import com.livekick.dto.football.StadiumDto;
import com.livekick.dto.football.TeamDto;
import com.livekick.dto.football.TeamSummaryDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class FootballCacheRepositoryTests {

    @Autowired
    private FootballCacheRepository repository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private PredictionRepository predictionRepository;

    @Test
    void storesAndReadsMvpFootballData() {
        TeamDto france = new TeamDto(1L, "France", "FRA", "France", "/flags/fra.png", "A");
        TeamDto brazil = new TeamDto(2L, "Brazil", "BRA", "Brazil", "/flags/bra.png", "A");
        repository.saveTeams(List.of(france, brazil));

        StadiumDto stadium = new StadiumDto(
                10L,
                "MetLife Stadium",
                "New York New Jersey Stadium",
                "East Rutherford",
                "United States",
                82500,
                "East"
        );
        repository.saveStadiums(List.of(stadium));

        FootballMatchDto match = new FootballMatchDto(
                100L,
                LocalDateTime.of(2026, 6, 20, 18, 0),
                "SCHEDULED",
                "GROUP_STAGE",
                "group",
                "A",
                1,
                null,
                null,
                null,
                summary(france),
                summary(brazil),
                stadium.id()
        );
        repository.saveMatches(List.of(match));

        CompetitionGroupDto group = new CompetitionGroupDto(
                "A",
                1,
                List.of(
                        new GroupStandingDto(summary(france), 1, 1, 0, 0, 3, 2, 0, 2),
                        new GroupStandingDto(summary(brazil), 1, 0, 0, 1, 0, 0, 2, -2)
                )
        );
        repository.saveGroups(List.of(group));

        PlayerDto player = new PlayerDto(
                1000L,
                france.id(),
                "Kylian",
                "Mbappe",
                "FORWARD",
                10,
                "French",
                "/players/mbappe.png",
                LocalDate.of(1998, 12, 20)
        );
        playerRepository.saveAll(List.of(player));

        PredictionDto prediction = predictionRepository.save(new PredictionDto(
                null,
                match.id(),
                45.0,
                30.0,
                25.0,
                2,
                1,
                72.0,
                "test-model",
                "Test prediction",
                Instant.parse("2026-06-20T12:00:00Z")
        ));

        assertThat(repository.findTeams()).extracting(TeamDto::name)
                .contains("France", "Brazil");
        assertThat(repository.findStadiums()).extracting(StadiumDto::name)
                .contains("MetLife Stadium");
        assertThat(repository.findMatches()).singleElement()
                .satisfies(cachedMatch -> {
                    assertThat(cachedMatch.id()).isEqualTo(100L);
                    assertThat(cachedMatch.homeTeam().fifaCode()).isEqualTo("FRA");
                    assertThat(cachedMatch.awayTeam().fifaCode()).isEqualTo("BRA");
                });
        assertThat(repository.findGroups()).singleElement()
                .satisfies(cachedGroup -> {
                    assertThat(cachedGroup.code()).isEqualTo("A");
                    assertThat(cachedGroup.standings()).hasSize(2);
                });
        assertThat(playerRepository.findById(player.id())).contains(player);
        assertThat(prediction.id()).isNotNull();
        assertThat(predictionRepository.findLatestByMatchId(match.id()))
                .contains(prediction);
    }

    private TeamSummaryDto summary(TeamDto team) {
        return new TeamSummaryDto(team.id(), team.name(), team.fifaCode(), team.flagUrl());
    }
}
