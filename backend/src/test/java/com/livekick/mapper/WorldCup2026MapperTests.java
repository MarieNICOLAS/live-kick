package com.livekick.mapper;

import com.livekick.integration.footballapi.WorldCupGamePayload;
import org.junit.jupiter.api.Test;

import java.util.Map;

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
    void mapsScoredUnfinishedMatchAsLive() {
        var match = mapper.toFootballMatchDto(buildGame("", "1", "0"), Map.of());

        assertThat(match.status()).isEqualTo("LIVE");
    }

    private WorldCupGamePayload buildGame(String timeElapsed, String homeScore, String awayScore) {
        return new WorldCupGamePayload(
                "81",
                "25",
                "34",
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
}
