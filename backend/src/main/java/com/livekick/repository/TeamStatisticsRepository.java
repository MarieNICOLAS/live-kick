package com.livekick.repository;

import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.TeamSummaryDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class TeamStatisticsRepository {

    private final JdbcTemplate jdbcTemplate;

    public TeamStatisticsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<FootballMatchDto> findFinishedMatchesByTeamId(Long teamId) {
        return jdbcTemplate.query("""
                SELECT
                    fm.id_match,
                    fm.match_date,
                    fm.status,
                    fm.phase,
                    fm.phase_type,
                    fm.group_code,
                    fm.matchday,
                    fm.home_score,
                    fm.away_score,
                    fm.current_minute,
                    fm.id_stadium,

                    home_team.id_team AS home_team_id,
                    home_team.name AS home_team_name,
                    home_team.fifa_code AS home_team_fifa_code,
                    home_team.flag_url AS home_team_flag_url,

                    away_team.id_team AS away_team_id,
                    away_team.name AS away_team_name,
                    away_team.fifa_code AS away_team_fifa_code,
                    away_team.flag_url AS away_team_flag_url

                FROM football_match fm
                LEFT JOIN team home_team ON home_team.id_team = fm.id_home_team
                LEFT JOIN team away_team ON away_team.id_team = fm.id_away_team
                WHERE fm.status = 'FINISHED'
                    AND (fm.id_home_team = ? OR fm.id_away_team = ?)
                    AND fm.home_score IS NOT NULL
                    AND fm.away_score IS NOT NULL
                ORDER BY fm.match_date DESC
                """, (resultSet, rowNumber) -> mapFootballMatch(resultSet), teamId, teamId);
    }

    private FootballMatchDto mapFootballMatch(ResultSet resultSet) throws SQLException {
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
                mapTeamSummary(resultSet, "home_team"),
                mapTeamSummary(resultSet, "away_team"),
                nullableLong(resultSet, "id_stadium")
        );
    }

    private TeamSummaryDto mapTeamSummary(ResultSet resultSet, String prefix) throws SQLException {
        Long id = nullableLong(resultSet, prefix + "_id");

        if (id == null) {
            return null;
        }

        return new TeamSummaryDto(
                id,
                resultSet.getString(prefix + "_name"),
                resultSet.getString(prefix + "_fifa_code"),
                resultSet.getString(prefix + "_flag_url")
        );
    }

    private Integer nullableInteger(ResultSet resultSet, String column) throws SQLException {
        int value = resultSet.getInt(column);
        return resultSet.wasNull() ? null : value;
    }

    private Long nullableLong(ResultSet resultSet, String column) throws SQLException {
        long value = resultSet.getLong(column);
        return resultSet.wasNull() ? null : value;
    }

    private LocalDateTime parseDateTime(String value) {
        return value == null || value.isBlank() ? null : LocalDateTime.parse(value);
    }
}