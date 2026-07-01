package com.livekick.service.ai;

import com.livekick.dto.ai.PredictionDto;
import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.TeamSummaryDto;
import com.livekick.exception.BadRequestException;
import com.livekick.exception.ExternalServiceException;
import com.livekick.integration.ai.AiPredictionClient;
import com.livekick.integration.ai.AiPredictionRequest;
import com.livekick.repository.PredictionRepository;
import com.livekick.service.football.FootballDataService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PredictionServiceTests {

    private final PredictionRepository predictionRepository = mock(PredictionRepository.class);
    private final FootballDataService footballDataService = mock(FootballDataService.class);
    private final AiPredictionClient aiPredictionClient = mock(AiPredictionClient.class);

    private final PredictionService service = new PredictionService(
            predictionRepository,
            footballDataService,
            aiPredictionClient
    );

    @Test
    void returnsCachedPredictionWithoutCallingAiService() {
        PredictionDto cachedPrediction = prediction(10L, "lmstudio-local-model");
        when(predictionRepository.findLatestByMatchId(100L)).thenReturn(Optional.of(cachedPrediction));

        PredictionDto result = service.getPrediction(100L);

        assertThat(result).isEqualTo(cachedPrediction);
        verify(footballDataService, never()).getMatch(any());
        verify(aiPredictionClient, never()).predict(any());
    }

    @Test
    void callsAiServiceAndStoresPredictionWhenNoCachedPredictionExists() {
        FootballMatchDto match = matchWithTeams();
        PredictionDto aiPrediction = prediction(null, "lmstudio-local-model");
        PredictionDto savedPrediction = prediction(20L, "lmstudio-local-model");

        when(predictionRepository.findLatestByMatchId(match.id())).thenReturn(Optional.empty());
        when(footballDataService.getMatch(match.id())).thenReturn(match);
        when(aiPredictionClient.predict(any(AiPredictionRequest.class))).thenReturn(aiPrediction);
        when(predictionRepository.save(aiPrediction)).thenReturn(savedPrediction);

        PredictionDto result = service.getPrediction(match.id());

        assertThat(result).isEqualTo(savedPrediction);
        ArgumentCaptor<AiPredictionRequest> requestCaptor = ArgumentCaptor.forClass(AiPredictionRequest.class);
        verify(aiPredictionClient).predict(requestCaptor.capture());
        assertThat(requestCaptor.getValue().matchId()).isEqualTo(match.id());
        assertThat(requestCaptor.getValue().homeTeam().fifaCode()).isEqualTo("FRA");
        assertThat(requestCaptor.getValue().awayTeam().fifaCode()).isEqualTo("BRA");
        verify(predictionRepository).save(aiPrediction);
    }

    @Test
    void replacesAiFallbackWithSavedLocalPrediction() {
        FootballMatchDto match = matchWithTeams();
        PredictionDto fallbackPrediction = prediction(null, "None");

        when(predictionRepository.findLatestByMatchId(match.id())).thenReturn(Optional.empty());
        when(footballDataService.getMatch(match.id())).thenReturn(match);
        when(aiPredictionClient.predict(any(AiPredictionRequest.class))).thenReturn(fallbackPrediction);
        when(predictionRepository.save(any(PredictionDto.class))).thenAnswer(invocation -> prediction(30L, invocation.getArgument(0, PredictionDto.class).modelName()));

        PredictionDto result = service.getPrediction(match.id());

        assertThat(result.modelName()).isEqualTo("LiveKick heuristique locale");
        assertThat(result.homeWinProbability() + result.drawProbability() + result.awayWinProbability()).isGreaterThan(99.0);
        assertThat(result.confidenceScore()).isGreaterThan(0.0);
        verify(predictionRepository).save(any(PredictionDto.class));
    }

    @Test
    void replacesUnavailableAiServiceWithSavedLocalPrediction() {
        FootballMatchDto match = matchWithTeams();

        when(predictionRepository.findLatestByMatchId(match.id())).thenReturn(Optional.empty());
        when(footballDataService.getMatch(match.id())).thenReturn(match);
        when(aiPredictionClient.predict(any(AiPredictionRequest.class))).thenThrow(new ExternalServiceException("AI down"));
        when(predictionRepository.save(any(PredictionDto.class))).thenAnswer(invocation -> prediction(30L, invocation.getArgument(0, PredictionDto.class).modelName()));

        PredictionDto result = service.getPrediction(match.id());

        assertThat(result.modelName()).isEqualTo("LiveKick heuristique locale");
        assertThat(result.homeWinProbability()).isGreaterThan(0.0);
        assertThat(result.drawProbability()).isGreaterThan(0.0);
        assertThat(result.awayWinProbability()).isGreaterThan(0.0);
        verify(predictionRepository).save(any(PredictionDto.class));
    }

    @Test
    void ignoresCachedEmptyFallbackPrediction() {
        FootballMatchDto match = matchWithTeams();

        when(predictionRepository.findLatestByMatchId(match.id())).thenReturn(Optional.of(new PredictionDto(
                99L,
                match.id(),
                0.0,
                0.0,
                0.0,
                0,
                0,
                0.0,
                "None",
                "Empty fallback",
                Instant.parse("2026-06-20T12:00:00Z")
        )));
        when(footballDataService.getMatch(match.id())).thenReturn(match);
        when(aiPredictionClient.predict(any(AiPredictionRequest.class))).thenThrow(new ExternalServiceException("AI down"));
        when(predictionRepository.save(any(PredictionDto.class))).thenAnswer(invocation -> prediction(30L, invocation.getArgument(0, PredictionDto.class).modelName()));

        PredictionDto result = service.getPrediction(match.id());

        assertThat(result.modelName()).isEqualTo("LiveKick heuristique locale");
        assertThat(result.homeWinProbability() + result.drawProbability() + result.awayWinProbability()).isGreaterThan(99.0);
    }

    @Test
    void rejectsPredictionWhenTeamsAreMissing() {
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
                null,
                new TeamSummaryDto(2L, "Brazil", "BRA", "/flags/bra.png"),
                10L
        );

        when(predictionRepository.findLatestByMatchId(match.id())).thenReturn(Optional.empty());
        when(footballDataService.getMatch(match.id())).thenReturn(match);

        assertThatThrownBy(() -> service.getPrediction(match.id()))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Prediction requires both teams to be known");

        verify(aiPredictionClient, never()).predict(any());
        verify(predictionRepository, never()).save(any());
    }

    @Test
    void generatesPredictionsForUpcomingMatchesWithKnownTeamsOnly() {
        FootballMatchDto predictableMatch = matchWithTeams();
        FootballMatchDto unknownHomeTeamMatch = new FootballMatchDto(
                101L,
                LocalDateTime.of(2026, 6, 21, 18, 0),
                "SCHEDULED",
                "GROUP_STAGE",
                "group",
                "A",
                1,
                null,
                null,
                null,
                null,
                new TeamSummaryDto(2L, "Brazil", "BRA", "/flags/bra.png"),
                10L
        );
        PredictionDto aiPrediction = prediction(null, "lmstudio-local-model");
        PredictionDto savedPrediction = prediction(20L, "lmstudio-local-model");

        when(footballDataService.getMatches(null, null, "SCHEDULED")).thenReturn(List.of(predictableMatch, unknownHomeTeamMatch));
        when(predictionRepository.findLatestByMatchId(predictableMatch.id())).thenReturn(Optional.empty());
        when(footballDataService.getMatch(predictableMatch.id())).thenReturn(predictableMatch);
        when(aiPredictionClient.predict(any(AiPredictionRequest.class))).thenReturn(aiPrediction);
        when(predictionRepository.save(aiPrediction)).thenReturn(savedPrediction);

        List<PredictionDto> result = service.getUpcomingKnownMatchPredictions();

        assertThat(result).containsExactly(savedPrediction);
        verify(footballDataService, never()).getMatch(unknownHomeTeamMatch.id());
    }

    @Test
    void generatesPredictionsForEveryKnownMatch() {
        FootballMatchDto predictableMatch = matchWithTeams();

        when(footballDataService.getMatches(null, null, null)).thenReturn(List.of(predictableMatch));
        when(predictionRepository.findLatestByMatchId(predictableMatch.id())).thenReturn(Optional.empty());
        when(footballDataService.getMatch(predictableMatch.id())).thenReturn(predictableMatch);
        when(aiPredictionClient.predict(any(AiPredictionRequest.class))).thenThrow(new ExternalServiceException("AI down"));
        when(predictionRepository.save(any(PredictionDto.class))).thenAnswer(invocation -> prediction(30L, invocation.getArgument(0, PredictionDto.class).modelName()));

        List<PredictionDto> result = service.getKnownMatchPredictions();

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().modelName()).isEqualTo("LiveKick heuristique locale");
    }

    private FootballMatchDto matchWithTeams() {
        return new FootballMatchDto(
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
                new TeamSummaryDto(1L, "France", "FRA", "/flags/fra.png"),
                new TeamSummaryDto(2L, "Brazil", "BRA", "/flags/bra.png"),
                10L
        );
    }

    private PredictionDto prediction(Long id, String modelName) {
        return new PredictionDto(
                id,
                100L,
                45.0,
                30.0,
                25.0,
                2,
                1,
                72.0,
                modelName,
                "France has a slight edge.",
                Instant.parse("2026-06-20T12:00:00Z")
        );
    }
}
