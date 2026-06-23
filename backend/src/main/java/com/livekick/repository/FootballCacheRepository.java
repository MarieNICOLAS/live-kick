package com.livekick.repository;

import com.livekick.dto.football.CompetitionGroupDto;
import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.GroupStandingDto;
import com.livekick.dto.football.StadiumDto;
import com.livekick.dto.football.TeamDto;
import com.livekick.dto.football.TeamSummaryDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class FootballCacheRepository {

    private final JdbcTemplate jdbcTemplate;

    public FootballCacheRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public void saveTeams(List<TeamDto> teams) {
        List<TeamDto> cacheableTeams = teams.stream()
                .filter(team -> team.id() != null)
                .toList();

        jdbcTemplate.batchUpdate("""
                INSERT INTO team (id_team, name, fifa_code, country, flag_url, group_code, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id_team) DO UPDATE SET
                    name = excluded.name,
                    fifa_code = excluded.fifa_code,
                    country = excluded.country,
                    flag_url = excluded.flag_url,
                    group_code = excluded.group_code,
                    updated_at = CURRENT_TIMESTAMP
                """, cacheableTeams, 50, this::setTeamParameters);
    }

    public List<TeamDto> findTeams() {
        return jdbcTemplate.query("""
                SELECT id_team, name, fifa_code, country, flag_url, group_code
                FROM team
                ORDER BY name
                """, (resultSet, rowNumber) -> new TeamDto(
                resultSet.getLong("id_team"),
                resultSet.getString("name"),
                resultSet.getString("fifa_code"),
                resultSet.getString("country"),
                resultSet.getString("flag_url"),
                resultSet.getString("group_code")
        ));
    }

    @Transactional
    public void saveStadiums(List<StadiumDto> stadiums) {
        List<StadiumDto> cacheableStadiums = stadiums.stream()
                .filter(stadium -> stadium.id() != null)
                .toList();

        jdbcTemplate.batchUpdate("""
                INSERT INTO stadium (
                    id_stadium, name, fifa_name, city, country, capacity, region, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id_stadium) DO UPDATE SET
                    name = excluded.name,
                    fifa_name = excluded.fifa_name,
                    city = excluded.city,
                    country = excluded.country,
                    capacity = excluded.capacity,
                    region = excluded.region,
                    updated_at = CURRENT_TIMESTAMP
                """, cacheableStadiums, 50, this::setStadiumParameters);
    }

    public List<StadiumDto> findStadiums() {
        return jdbcTemplate.query("""
                SELECT id_stadium, name, fifa_name, city, country, capacity, region
                FROM stadium
                ORDER BY id_stadium
                """, (resultSet, rowNumber) -> new StadiumDto(
                resultSet.getLong("id_stadium"),
                resultSet.getString("name"),
                resultSet.getString("fifa_name"),
                resultSet.getString("city"),
                resultSet.getString("country"),
                nullableInteger(resultSet, "capacity"),
                resultSet.getString("region")
        ));
    }

    @Transactional
    public void saveMatches(List<FootballMatchDto> matches) {
        List<FootballMatchDto> cacheableMatches = matches.stream()
                .filter(match -> match.id() != null)
                .toList();

        jdbcTemplate.batchUpdate("""
                INSERT INTO football_match (
                    id_match, match_date, status, phase, phase_type, group_code, matchday,
                    home_score, away_score, current_minute, id_home_team, id_away_team,
                    id_stadium, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id_match) DO UPDATE SET
                    match_date = excluded.match_date,
                    status = excluded.status,
                    phase = excluded.phase,
                    phase_type = excluded.phase_type,
                    group_code = excluded.group_code,
                    matchday = excluded.matchday,
                    home_score = excluded.home_score,
                    away_score = excluded.away_score,
                    current_minute = excluded.current_minute,
                    id_home_team = excluded.id_home_team,
                    id_away_team = excluded.id_away_team,
                    id_stadium = excluded.id_stadium,
                    updated_at = CURRENT_TIMESTAMP
                """, cacheableMatches, 50, this::setMatchParameters);
    }

    public List<FootballMatchDto> findMatches() {
        Map<Long, TeamSummaryDto> teamsById = findTeamSummaries();

        return jdbcTemplate.query("""
                SELECT id_match, match_date, status, phase, phase_type, group_code, matchday,
                       home_score, away_score, current_minute, id_home_team, id_away_team,
                       id_stadium
                FROM football_match
                ORDER BY id_match
                """, (resultSet, rowNumber) -> {
            Long homeTeamId = nullableLong(resultSet, "id_home_team");
            Long awayTeamId = nullableLong(resultSet, "id_away_team");
            return new FootballMatchDto(
                    resultSet.getLong("id_match"),
                    parseDateTime(resultSet.getString("match_date")),
                    resultSet.getString("status"),
                    resultSet.getString("phase"),
                    resultSet.getString("phase_type"),
                    resultSet.getString("group_code"),
                    nullableInteger(resultSet, "matchday"),
                    nullableInteger(resultSet, "home_score"),
                    nullableInteger(resultSet, "away_score"),
                    nullableInteger(resultSet, "current_minute"),
                    teamSummary(homeTeamId, teamsById),
                    teamSummary(awayTeamId, teamsById),
                    nullableLong(resultSet, "id_stadium")
            );
        });
    }

    @Transactional
    public void saveGroups(List<CompetitionGroupDto> groups) {
        for (CompetitionGroupDto group : groups) {
            if (group.code() == null || group.code().isBlank()) {
                continue;
            }

            jdbcTemplate.update("""
                    INSERT INTO competition_group (group_code, display_order, updated_at)
                    VALUES (?, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(group_code) DO UPDATE SET
                        display_order = excluded.display_order,
                        updated_at = CURRENT_TIMESTAMP
                    """, group.code(), group.displayOrder());

            jdbcTemplate.update("DELETE FROM team_group WHERE group_code = ?", group.code());
            List<GroupStandingDto> standings = group.standings() == null ? List.of() : group.standings();
            for (GroupStandingDto standing : standings) {
                if (standing.team() == null || standing.team().id() == null) {
                    continue;
                }
                jdbcTemplate.update("""
                        INSERT INTO team_group (
                            group_code, id_team, matches_played, wins, draws, losses, points,
                            goals_for, goals_against, goal_difference, updated_at
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                        """,
                        group.code(),
                        standing.team().id(),
                        standing.matchesPlayed(),
                        standing.wins(),
                        standing.draws(),
                        standing.losses(),
                        standing.points(),
                        standing.goalsFor(),
                        standing.goalsAgainst(),
                        standing.goalDifference()
                );
            }
        }
    }

    public List<CompetitionGroupDto> findGroups() {
        Map<Long, TeamSummaryDto> teamsById = findTeamSummaries();
        Map<String, CompetitionGroupBuilder> groups = new LinkedHashMap<>();

        jdbcTemplate.query("""
                SELECT group_code, display_order
                FROM competition_group
                ORDER BY display_order, group_code
                """, (RowCallbackHandler) resultSet -> groups.put(
                resultSet.getString("group_code"),
                new CompetitionGroupBuilder(
                        resultSet.getString("group_code"),
                        nullableInteger(resultSet, "display_order")
                )
        ));

        jdbcTemplate.query("""
                SELECT group_code, id_team, matches_played, wins, draws, losses, points,
                       goals_for, goals_against, goal_difference
                FROM team_group
                ORDER BY group_code, points DESC, goal_difference DESC
                """, (RowCallbackHandler) resultSet -> {
            CompetitionGroupBuilder group = groups.get(resultSet.getString("group_code"));
            if (group == null) {
                return;
            }
            Long teamId = resultSet.getLong("id_team");
            group.standings.add(new GroupStandingDto(
                    teamSummary(teamId, teamsById),
                    nullableInteger(resultSet, "matches_played"),
                    nullableInteger(resultSet, "wins"),
                    nullableInteger(resultSet, "draws"),
                    nullableInteger(resultSet, "losses"),
                    nullableInteger(resultSet, "points"),
                    nullableInteger(resultSet, "goals_for"),
                    nullableInteger(resultSet, "goals_against"),
                    nullableInteger(resultSet, "goal_difference")
            ));
        });

        return groups.values().stream()
                .map(group -> new CompetitionGroupDto(group.code, group.displayOrder, List.copyOf(group.standings)))
                .toList();
    }

    private Map<Long, TeamSummaryDto> findTeamSummaries() {
        Map<Long, TeamSummaryDto> teams = new LinkedHashMap<>();
        jdbcTemplate.query("""
                SELECT id_team, name, fifa_code, flag_url
                FROM team
                """, (RowCallbackHandler) resultSet -> {
            long id = resultSet.getLong("id_team");
            teams.put(id, new TeamSummaryDto(
                    id,
                    resultSet.getString("name"),
                    resultSet.getString("fifa_code"),
                    resultSet.getString("flag_url")
            ));
        });
        return teams;
    }

    private void setTeamParameters(PreparedStatement statement, TeamDto team) throws SQLException {
        statement.setLong(1, team.id());
        statement.setString(2, team.name());
        statement.setString(3, team.fifaCode());
        statement.setString(4, team.country());
        statement.setString(5, team.flagUrl());
        statement.setString(6, team.groupCode());
    }

    private void setStadiumParameters(PreparedStatement statement, StadiumDto stadium) throws SQLException {
        statement.setLong(1, stadium.id());
        statement.setString(2, stadium.name());
        statement.setString(3, stadium.fifaName());
        statement.setString(4, stadium.city());
        statement.setString(5, stadium.country());
        statement.setObject(6, stadium.capacity());
        statement.setString(7, stadium.region());
    }

    private void setMatchParameters(PreparedStatement statement, FootballMatchDto match) throws SQLException {
        statement.setLong(1, match.id());
        statement.setString(2, match.matchDate() == null ? null : match.matchDate().toString());
        statement.setString(3, match.status());
        statement.setString(4, match.phase());
        statement.setString(5, match.phaseType());
        statement.setString(6, match.groupCode());
        statement.setObject(7, match.matchday());
        statement.setObject(8, match.homeScore());
        statement.setObject(9, match.awayScore());
        statement.setObject(10, match.currentMinute());
        statement.setObject(11, match.homeTeam() == null ? null : match.homeTeam().id());
        statement.setObject(12, match.awayTeam() == null ? null : match.awayTeam().id());
        statement.setObject(13, match.stadiumId());
    }

    private TeamSummaryDto teamSummary(Long id, Map<Long, TeamSummaryDto> teamsById) {
        if (id == null) {
            return new TeamSummaryDto(null, null, null, null);
        }
        return teamsById.getOrDefault(id, new TeamSummaryDto(id, null, null, null));
    }

    private Integer nullableInteger(java.sql.ResultSet resultSet, String column) throws SQLException {
        int value = resultSet.getInt(column);
        return resultSet.wasNull() ? null : value;
    }

    private Long nullableLong(java.sql.ResultSet resultSet, String column) throws SQLException {
        long value = resultSet.getLong(column);
        return resultSet.wasNull() ? null : value;
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException exception) {
            return null;
        }
    }

    private static final class CompetitionGroupBuilder {
        private final String code;
        private final Integer displayOrder;
        private final List<GroupStandingDto> standings = new ArrayList<>();

        private CompetitionGroupBuilder(String code, Integer displayOrder) {
            this.code = code;
            this.displayOrder = displayOrder;
        }
    }
}
