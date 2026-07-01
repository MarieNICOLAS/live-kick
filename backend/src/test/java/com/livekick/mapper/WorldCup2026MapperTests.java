package com.livekick.mapper;

import com.livekick.dto.football.TeamDto;
import com.livekick.integration.footballapi.WorldCupGamePayload;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static java.util.Map.entry;
import static org.assertj.core.api.Assertions.assertThat;

class WorldCup2026MapperTests {

    private final WorldCup2026Mapper mapper = new WorldCup2026Mapper();

    @Test
    void mapsProviderMinuteAsLiveState() {
        var match = mapper.toFootballMatchDto(buildGame("67'", null, null), Map.of());

        assertThat(match.status()).isEqualTo("LIVE");
        assertThat(match.currentMinute()).isEqualTo(67);
    }

    @Test
    void mapsSecondHalfLabelAsLiveWithoutFakeMinute() {
        var match = mapper.toFootballMatchDto(buildGame("2nd half", null, null), Map.of());

        assertThat(match.status()).isEqualTo("LIVE");
        assertThat(match.currentMinute()).isNull();
    }

    @Test
    void keepsScoredUnfinishedMatchScheduledWithoutLiveSignal() {
        var match = mapper.toFootballMatchDto(buildGame("", "1", "0"), Map.of());

        assertThat(match.status()).isEqualTo("SCHEDULED");
    }

    @Test
    void normalizesKnownRoundOf32VenuesToKeepLocalKickoffTimesCoherent() {
        var teamsById = Map.ofEntries(
                entry(45L, new TeamDto(45L, "England", "ENG", "England", null, "L")),
                entry(42L, new TeamDto(42L, "DR Congo", "COD", "DR Congo", null, "H")),
                entry(25L, new TeamDto(25L, "Belgium", "BEL", "Belgium", null, "G")),
                entry(34L, new TeamDto(34L, "Senegal", "SEN", "Senegal", null, "I")),
                entry(13L, new TeamDto(13L, "United States", "USA", "United States", null, "D")),
                entry(6L, new TeamDto(6L, "Bosnia and Herzegovina", "BIH", "Bosnia and Herzegovina", null, "B")),
                entry(29L, new TeamDto(29L, "Spain", "ESP", "Spain", null, "K")),
                entry(39L, new TeamDto(39L, "Austria", "AUT", "Austria", null, "J")),
                entry(41L, new TeamDto(41L, "Portugal", "POR", "Portugal", null, "H")),
                entry(46L, new TeamDto(46L, "Croatia", "CRO", "Croatia", null, "J")),
                entry(8L, new TeamDto(8L, "Switzerland", "SUI", "Switzerland", null, "B")),
                entry(38L, new TeamDto(38L, "Algeria", "ALG", "Algeria", null, "J")),
                entry(15L, new TeamDto(15L, "Australia", "AUS", "Australia", null, "D")),
                entry(26L, new TeamDto(26L, "Egypt", "EGY", "Egypt", null, "A")),
                entry(37L, new TeamDto(37L, "Argentina", "ARG", "Argentina", null, "J")),
                entry(30L, new TeamDto(30L, "Cape Verde", "CPV", "Cape Verde", null, "E")),
                entry(44L, new TeamDto(44L, "Colombia", "COL", "Colombia", null, "L")),
                entry(47L, new TeamDto(47L, "Ghana", "GHA", "Ghana", null, "L"))
        );

        var fixtureCases = List.of(
                new FixtureCase("45", "42", 6L),
                new FixtureCase("25", "34", 16L),
                new FixtureCase("13", "6", 7L),
                new FixtureCase("29", "39", 8L),
                new FixtureCase("41", "46", 4L),
                new FixtureCase("8", "38", 5L),
                new FixtureCase("15", "26", 15L),
                new FixtureCase("37", "30", 12L),
                new FixtureCase("44", "47", 14L)
        );

        for (FixtureCase fixtureCase : fixtureCases) {
            var match = mapper.toFootballMatchDto(buildGame(fixtureCase.homeTeamId(), fixtureCase.awayTeamId(), "", null, null), teamsById);

            assertThat(match.stadiumId()).isEqualTo(fixtureCase.expectedStadiumId());
        }
    }

    private WorldCupGamePayload buildGame(String timeElapsed, String homeScore, String awayScore) {
        return buildGame("25", "34", timeElapsed, homeScore, awayScore);
    }

    private WorldCupGamePayload buildGame(String homeTeamId, String awayTeamId, String timeElapsed, String homeScore, String awayScore) {
        return new WorldCupGamePayload(
                "81",
                homeTeamId,
                awayTeamId,
                homeScore,
                awayScore,
                null,
                null,
                "07/01/2026 13:00",
                "16",
                "FALSE",
                timeElapsed,
                "r32",
                "Belgium",
                "Senegal",
                null,
                null
        );
    }

    private record FixtureCase(String homeTeamId, String awayTeamId, Long expectedStadiumId) {
    }
}
