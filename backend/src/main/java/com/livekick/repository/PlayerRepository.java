package com.livekick.repository;

import com.livekick.dto.football.PlayerDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public class PlayerRepository {

    private final JdbcTemplate jdbcTemplate;

    public PlayerRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void saveAll(List<PlayerDto> players) {
        List<PlayerDto> cacheablePlayers = players.stream()
                .filter(player -> player.id() != null && player.teamId() != null)
                .toList();

        jdbcTemplate.batchUpdate("""
                INSERT INTO player (
                    id_player, id_team, first_name, last_name, position, shirt_number,
                    nationality, photo_url, birth_date, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id_player) DO UPDATE SET
                    id_team = excluded.id_team,
                    first_name = excluded.first_name,
                    last_name = excluded.last_name,
                    position = excluded.position,
                    shirt_number = excluded.shirt_number,
                    nationality = excluded.nationality,
                    photo_url = excluded.photo_url,
                    birth_date = excluded.birth_date,
                    updated_at = CURRENT_TIMESTAMP
                """, cacheablePlayers, 50, this::setParameters);
    }

    public List<PlayerDto> findAll(Long teamId) {
        if (teamId == null) {
            return jdbcTemplate.query("""
                    SELECT id_player, id_team, first_name, last_name, position, shirt_number,
                           nationality, photo_url, birth_date
                    FROM player
                    ORDER BY last_name, first_name
                    """, (resultSet, rowNumber) -> mapPlayer(resultSet));
        }

        return jdbcTemplate.query("""
                SELECT id_player, id_team, first_name, last_name, position, shirt_number,
                       nationality, photo_url, birth_date
                FROM player
                WHERE id_team = ?
                ORDER BY last_name, first_name
                """, (resultSet, rowNumber) -> mapPlayer(resultSet), teamId);
    }

    public Optional<PlayerDto> findById(Long id) {
        return jdbcTemplate.query("""
                SELECT id_player, id_team, first_name, last_name, position, shirt_number,
                       nationality, photo_url, birth_date
                FROM player
                WHERE id_player = ?
                """, (resultSet, rowNumber) -> mapPlayer(resultSet), id).stream().findFirst();
    }

    private PlayerDto mapPlayer(java.sql.ResultSet resultSet) throws SQLException {
        return new PlayerDto(
                resultSet.getLong("id_player"),
                resultSet.getLong("id_team"),
                resultSet.getString("first_name"),
                resultSet.getString("last_name"),
                resultSet.getString("position"),
                nullableInteger(resultSet, "shirt_number"),
                resultSet.getString("nationality"),
                resultSet.getString("photo_url"),
                parseDate(resultSet.getString("birth_date"))
        );
    }

    private void setParameters(PreparedStatement statement, PlayerDto player) throws SQLException {
        statement.setLong(1, player.id());
        statement.setLong(2, player.teamId());
        statement.setString(3, player.firstName());
        statement.setString(4, player.lastName());
        statement.setString(5, player.position());
        statement.setObject(6, player.shirtNumber());
        statement.setString(7, player.nationality());
        statement.setString(8, player.photoUrl());
        statement.setString(9, player.birthDate() == null ? null : player.birthDate().toString());
    }

    private Integer nullableInteger(java.sql.ResultSet resultSet, String column) throws SQLException {
        int value = resultSet.getInt(column);
        return resultSet.wasNull() ? null : value;
    }

    private LocalDate parseDate(String value) {
        return value == null || value.isBlank() ? null : LocalDate.parse(value);
    }
}
