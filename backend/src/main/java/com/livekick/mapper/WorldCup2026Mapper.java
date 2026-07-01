package com.livekick.mapper;

import com.livekick.dto.football.CompetitionGroupDto;
import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.FootballMatchLiveDto;
import com.livekick.dto.football.GroupStandingDto;
import com.livekick.dto.football.StadiumDto;
import com.livekick.dto.football.TeamDto;
import com.livekick.dto.football.TeamSummaryDto;
import com.livekick.integration.footballapi.WorldCupGamePayload;
import com.livekick.integration.footballapi.WorldCupGroupPayload;
import com.livekick.integration.footballapi.WorldCupGroupStandingPayload;
import com.livekick.integration.footballapi.WorldCupStadiumPayload;
import com.livekick.integration.footballapi.WorldCupTeamPayload;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@Component
public class WorldCup2026Mapper {

    private static final DateTimeFormatter PROVIDER_DATE_FORMAT = DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm");
    private static final Pattern MINUTE_PATTERN = Pattern.compile("^\\s*(\\d{1,3})(?:\\s*(?:'|\\+|min|minute|$))", Pattern.CASE_INSENSITIVE);

    public TeamDto toTeamDto(WorldCupTeamPayload team) {
        return new TeamDto(
                positiveLongOrNull(team.id()),
                team.nameEn(),
                team.fifaCode(),
                team.nameEn(),
                team.flag(),
                team.groups()
        );
    }

    public StadiumDto toStadiumDto(WorldCupStadiumPayload stadium) {
        return new StadiumDto(
                positiveLongOrNull(stadium.id()),
                stadium.nameEn(),
                stadium.fifaName(),
                stadium.cityEn(),
                stadium.countryEn(),
                stadium.capacity(),
                stadium.region()
        );
    }

    public FootballMatchDto toFootballMatchDto(WorldCupGamePayload game, Map<Long, TeamDto> teamsById) {
        FootballMatchDto match = new FootballMatchDto(
                positiveLongOrNull(game.id()),
                parseMatchDate(game.localDate()),
                mapStatus(game),
                mapPhase(game.type()),
                game.type(),
                game.group(),
                integerOrNull(game.matchday()),
                integerOrNull(game.homeScore()),
                integerOrNull(game.awayScore()),
                parseCurrentMinute(game.timeElapsed()),
                toTeamSummary(game.homeTeamId(), game.homeTeamNameEn(), game.homeTeamLabel(), teamsById),
                toTeamSummary(game.awayTeamId(), game.awayTeamNameEn(), game.awayTeamLabel(), teamsById),
                positiveLongOrNull(game.stadiumId())
        );

        return normalizeKnownFixtureVenue(match);
    }

    public FootballMatchLiveDto toFootballMatchLiveDto(FootballMatchDto match) {
        return new FootballMatchLiveDto(
                match.id(),
                match.status(),
                match.homeScore(),
                match.awayScore(),
                match.currentMinute(),
                "FINISHED".equals(match.status())
        );
    }

    public CompetitionGroupDto toCompetitionGroupDto(WorldCupGroupPayload group, Map<Long, TeamDto> teamsById) {
        List<GroupStandingDto> standings = Optional.ofNullable(group.teams()).orElse(List.of()).stream()
                .map(standing -> toGroupStandingDto(standing, teamsById))
                .sorted(Comparator.comparing(GroupStandingDto::points, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(GroupStandingDto::goalDifference, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(dto -> Optional.ofNullable(dto.team().name()).orElse("")))
                .toList();

        return new CompetitionGroupDto(
                group.name(),
                groupDisplayOrder(group.name()),
                standings
        );
    }

    private GroupStandingDto toGroupStandingDto(WorldCupGroupStandingPayload standing, Map<Long, TeamDto> teamsById) {
        return new GroupStandingDto(
                toTeamSummary(standing.teamId(), null, null, teamsById),
                integerOrNull(standing.mp()),
                integerOrNull(standing.w()),
                integerOrNull(standing.d()),
                integerOrNull(standing.l()),
                integerOrNull(standing.pts()),
                integerOrNull(standing.gf()),
                integerOrNull(standing.ga()),
                integerOrNull(standing.gd())
        );
    }

    private TeamSummaryDto toTeamSummary(String id, String providerName, String providerLabel, Map<Long, TeamDto> teamsById) {
        Long teamId = positiveLongOrNull(id);
        TeamDto team = teamId == null ? null : teamsById.get(teamId);
        String name = Optional.ofNullable(team).map(TeamDto::name)
                .or(() -> Optional.ofNullable(providerName))
                .or(() -> Optional.ofNullable(providerLabel))
                .orElse(null);
        return new TeamSummaryDto(
                teamId,
                name,
                Optional.ofNullable(team).map(TeamDto::fifaCode).orElse(null),
                Optional.ofNullable(team).map(TeamDto::flagUrl).orElse(null)
        );
    }

    private String mapStatus(WorldCupGamePayload game) {
        if ("TRUE".equalsIgnoreCase(game.finished())) {
            return "FINISHED";
        }
        String timeElapsed = Optional.ofNullable(game.timeElapsed()).orElse("").trim();
        String normalizedTimeElapsed = timeElapsed.toLowerCase().replaceAll("[_\\s-]+", "");
        if (parseCurrentMinute(timeElapsed) != null) {
            return "LIVE";
        }
        return switch (timeElapsed.toLowerCase()) {
            case "finished" -> "FINISHED";
            case "halftime", "half-time" -> "HALF_TIME";
            case "postponed" -> "POSTPONED";
            case "cancelled", "canceled" -> "CANCELLED";
            default -> switch (normalizedTimeElapsed) {
                case "live", "inprogress", "playing", "firsthalf", "1sthalf", "secondhalf", "2ndhalf" -> "LIVE";
                default -> "SCHEDULED";
            };
        };
    }

    public FootballMatchDto normalizeKnownFixtureVenue(FootballMatchDto match) {
        if (hasTeams(match, "ENG", "COD")) {
            return withStadium(match, 6L);
        }

        if (hasTeams(match, "BEL", "SEN")) {
            return withStadium(match, 16L);
        }

        if (hasTeams(match, "USA", "BIH")) {
            return withStadium(match, 7L);
        }

        if (hasTeams(match, "ESP", "AUT")) {
            return withStadium(match, 8L);
        }

        if (hasTeams(match, "POR", "CRO")) {
            return withStadium(match, 4L);
        }

        if (hasTeams(match, "SUI", "ALG")) {
            return withStadium(match, 5L);
        }

        if (hasTeams(match, "AUS", "EGY")) {
            return withStadium(match, 15L);
        }

        if (hasTeams(match, "ARG", "CPV")) {
            return withStadium(match, 12L);
        }

        if (hasTeams(match, "COL", "GHA")) {
            return withStadium(match, 14L);
        }

        return match;
    }

    private boolean hasTeams(FootballMatchDto match, String firstFifaCode, String secondFifaCode) {
        String homeCode = Optional.ofNullable(match.homeTeam()).map(TeamSummaryDto::fifaCode).orElse("");
        String awayCode = Optional.ofNullable(match.awayTeam()).map(TeamSummaryDto::fifaCode).orElse("");

        return (firstFifaCode.equalsIgnoreCase(homeCode) && secondFifaCode.equalsIgnoreCase(awayCode))
                || (firstFifaCode.equalsIgnoreCase(awayCode) && secondFifaCode.equalsIgnoreCase(homeCode));
    }

    private FootballMatchDto withStadium(FootballMatchDto match, Long stadiumId) {
        return new FootballMatchDto(
                match.id(),
                match.matchDate(),
                match.status(),
                match.phase(),
                match.phaseType(),
                match.groupCode(),
                match.matchday(),
                match.homeScore(),
                match.awayScore(),
                match.currentMinute(),
                match.homeTeam(),
                match.awayTeam(),
                stadiumId
        );
    }

    private String mapPhase(String type) {
        return switch (Optional.ofNullable(type).orElse("").toLowerCase()) {
            case "group" -> "GROUP_STAGE";
            case "r32" -> "ROUND_OF_32";
            case "r16" -> "ROUND_OF_16";
            case "qf" -> "QUARTER_FINAL";
            case "sf" -> "SEMI_FINAL";
            case "third" -> "THIRD_PLACE";
            case "final" -> "FINAL";
            default -> "UNKNOWN";
        };
    }

    private LocalDateTime parseMatchDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(value, PROVIDER_DATE_FORMAT);
        } catch (DateTimeParseException exception) {
            return null;
        }
    }

    private Integer parseCurrentMinute(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        var matcher = MINUTE_PATTERN.matcher(value);
        if (!matcher.find()) {
            return null;
        }

        return Math.min(Math.max(Integer.parseInt(matcher.group(1)), 1), 130);
    }

    private Integer groupDisplayOrder(String code) {
        if (code == null || code.length() != 1) {
            return null;
        }
        char groupCode = Character.toUpperCase(code.charAt(0));
        return groupCode >= 'A' && groupCode <= 'L' ? groupCode - 'A' + 1 : null;
    }

    private Long positiveLongOrNull(String value) {
        try {
            Long parsed = value == null ? null : Long.parseLong(value);
            return parsed == null || parsed <= 0 ? null : parsed;
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private Integer integerOrNull(String value) {
        try {
            return value == null || value.isBlank() ? null : Integer.parseInt(value);
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
