package com.livekick.mapper;

import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.PlayerDto;
import com.livekick.dto.football.StadiumDto;
import com.livekick.dto.football.TeamDto;
import com.livekick.dto.football.TeamSummaryDto;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class FrenchFootballLabelMapperTests {

    private final FrenchFootballLabelMapper mapper = new FrenchFootballLabelMapper();

    @Test
    void localizesTeamsByFifaCodeAndCountry() {
        TeamDto team = mapper.localize(new TeamDto(
                13L,
                "United States",
                "USA",
                "United States",
                "/flags/usa.png",
                "D"
        ));

        assertThat(team.name()).isEqualTo("États-Unis");
        assertThat(team.country()).isEqualTo("États-Unis");
        assertThat(team.fifaCode()).isEqualTo("USA");
    }

    @Test
    void localizesStadiumNameFifaNameCityAndCountry() {
        StadiumDto stadium = mapper.localize(new StadiumDto(
                10L,
                "MetLife Stadium",
                "New York New Jersey Stadium",
                "East Rutherford",
                "United States",
                80663,
                null
        ));

        assertThat(stadium.name()).isEqualTo("Stade MetLife");
        assertThat(stadium.fifaName()).isEqualTo("Stade de New York New Jersey");
        assertThat(stadium.city()).isEqualTo("East Rutherford");
        assertThat(stadium.country()).isEqualTo("États-Unis");
    }

    @Test
    void localizesMatchTeamsAndPlaceholderNames() {
        FootballMatchDto match = mapper.localize(new FootballMatchDto(
                77L,
                LocalDateTime.of(2026, 7, 4, 21, 0),
                "SCHEDULED",
                "ROUND_OF_16",
                "r16",
                null,
                null,
                null,
                null,
                null,
                new TeamSummaryDto(9L, "Brazil", "BRA", "/flags/bra.png"),
                new TeamSummaryDto(null, "Winner Match 12", null, null),
                10L
        ));

        assertThat(match.homeTeam().name()).isEqualTo("Brésil");
        assertThat(match.awayTeam().name()).isEqualTo("Vainqueur du match 12");
        assertThat(match.status()).isEqualTo("SCHEDULED");
    }

    @Test
    void localizesPlayerNationality() {
        PlayerDto player = mapper.localize(new PlayerDto(
                1L,
                3L,
                "Heung Min",
                "SON",
                "FW",
                7,
                "South Korea",
                null,
                LocalDate.of(1992, 7, 8)
        ));

        assertThat(player.nationality()).isEqualTo("Corée du Sud");
    }
}
