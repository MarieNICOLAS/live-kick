package com.livekick.repository;

import com.livekick.dto.ai.PredictionDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.Instant;
import java.util.Optional;

@Repository
public class PredictionRepository {

    private final JdbcTemplate jdbcTemplate;

    public PredictionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public PredictionDto save(PredictionDto prediction) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement("""
                    INSERT INTO prediction (
                        id_match, home_win_probability, draw_probability,
                        away_win_probability, predicted_home_score, predicted_away_score,
                        confidence_score, model_name, explanation, generated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            statement.setLong(1, prediction.matchId());
            statement.setDouble(2, prediction.homeWinProbability());
            statement.setDouble(3, prediction.drawProbability());
            statement.setDouble(4, prediction.awayWinProbability());
            statement.setInt(5, prediction.predictedHomeScore());
            statement.setInt(6, prediction.predictedAwayScore());
            statement.setDouble(7, prediction.confidenceScore());
            statement.setString(8, prediction.modelName());
            statement.setString(9, prediction.explanation());
            statement.setString(10, prediction.generatedAt().toString());
            return statement;
        }, keyHolder);

        Number id = keyHolder.getKey();
        return new PredictionDto(
                id == null ? null : id.longValue(),
                prediction.matchId(),
                prediction.homeWinProbability(),
                prediction.drawProbability(),
                prediction.awayWinProbability(),
                prediction.predictedHomeScore(),
                prediction.predictedAwayScore(),
                prediction.confidenceScore(),
                prediction.modelName(),
                prediction.explanation(),
                prediction.generatedAt()
        );
    }

    public Optional<PredictionDto> findLatestByMatchId(Long matchId) {
        return jdbcTemplate.query("""
                SELECT id_prediction, id_match, home_win_probability, draw_probability,
                       away_win_probability, predicted_home_score, predicted_away_score,
                       confidence_score, model_name, explanation, generated_at
                FROM prediction
                WHERE id_match = ?
                ORDER BY generated_at DESC, id_prediction DESC
                LIMIT 1
                """, (resultSet, rowNumber) -> new PredictionDto(
                resultSet.getLong("id_prediction"),
                resultSet.getLong("id_match"),
                resultSet.getDouble("home_win_probability"),
                resultSet.getDouble("draw_probability"),
                resultSet.getDouble("away_win_probability"),
                resultSet.getInt("predicted_home_score"),
                resultSet.getInt("predicted_away_score"),
                resultSet.getDouble("confidence_score"),
                resultSet.getString("model_name"),
                resultSet.getString("explanation"),
                Instant.parse(resultSet.getString("generated_at"))
        ), matchId).stream().findFirst();
    }
}
