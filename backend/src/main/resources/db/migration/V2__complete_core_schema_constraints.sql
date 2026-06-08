ALTER TABLE "user"
    ADD CONSTRAINT chk_user_username_not_blank CHECK (length(trim(username)) > 0),
    ADD CONSTRAINT chk_user_email_not_blank CHECK (length(trim(email)) > 0),
    ADD CONSTRAINT chk_user_gdpr_acceptance CHECK (
        gdpr_accepted = FALSE
        OR gdpr_acceptance_date IS NOT NULL
    );

ALTER TABLE user_preference
    ADD CONSTRAINT chk_user_preference_language_not_blank CHECK (length(trim(language)) > 0);

ALTER TABLE notification
    ADD CONSTRAINT chk_notification_type CHECK (
        notification_type IN (
            'MATCH_STATUS',
            'MATCH_EVENT',
            'PREDICTION',
            'FAVORITE',
            'SYSTEM'
        )
    ),
    ADD CONSTRAINT chk_notification_read_at CHECK (
        is_read = FALSE
        OR read_at IS NOT NULL
    );

ALTER TABLE competition
    ADD CONSTRAINT chk_competition_year CHECK (year >= 2026),
    ADD CONSTRAINT chk_competition_name_not_blank CHECK (length(trim(name)) > 0);

ALTER TABLE competition_phase
    ADD CONSTRAINT chk_competition_phase_display_order CHECK (display_order > 0);

ALTER TABLE competition_group
    ADD CONSTRAINT chk_competition_group_display_order CHECK (display_order > 0),
    ADD CONSTRAINT chk_competition_group_name_not_blank CHECK (length(trim(name)) > 0);

ALTER TABLE team
    ADD CONSTRAINT chk_team_name_not_blank CHECK (length(trim(name)) > 0),
    ADD CONSTRAINT chk_team_fifa_code_format CHECK (
        length(fifa_code) = 3
        AND fifa_code = upper(fifa_code)
    ),
    ADD CONSTRAINT chk_team_world_ranking CHECK (
        world_ranking IS NULL
        OR world_ranking > 0
    );

ALTER TABLE player
    ADD CONSTRAINT chk_player_first_name_not_blank CHECK (length(trim(first_name)) > 0),
    ADD CONSTRAINT chk_player_last_name_not_blank CHECK (length(trim(last_name)) > 0),
    ADD CONSTRAINT chk_player_shirt_number CHECK (
        shirt_number IS NULL
        OR shirt_number BETWEEN 0 AND 99
    );

ALTER TABLE team_group
    ADD CONSTRAINT chk_team_group_points CHECK (points >= 0),
    ADD CONSTRAINT chk_team_group_wins CHECK (wins >= 0),
    ADD CONSTRAINT chk_team_group_draws CHECK (draws >= 0),
    ADD CONSTRAINT chk_team_group_losses CHECK (losses >= 0),
    ADD CONSTRAINT chk_team_group_goals_for CHECK (goals_for >= 0),
    ADD CONSTRAINT chk_team_group_goals_against CHECK (goals_against >= 0),
    ADD CONSTRAINT chk_team_group_ranking CHECK (
        ranking IS NULL
        OR ranking > 0
    );

ALTER TABLE stadium
    ADD CONSTRAINT chk_stadium_name_not_blank CHECK (length(trim(name)) > 0),
    ADD CONSTRAINT chk_stadium_capacity CHECK (
        capacity IS NULL
        OR capacity > 0
    ),
    ADD CONSTRAINT chk_stadium_latitude CHECK (
        latitude IS NULL
        OR latitude BETWEEN -90 AND 90
    ),
    ADD CONSTRAINT chk_stadium_longitude CHECK (
        longitude IS NULL
        OR longitude BETWEEN -180 AND 180
    );

ALTER TABLE football_match
    ADD CONSTRAINT chk_football_match_home_score CHECK (
        home_score IS NULL
        OR home_score >= 0
    ),
    ADD CONSTRAINT chk_football_match_away_score CHECK (
        away_score IS NULL
        OR away_score >= 0
    ),
    ADD CONSTRAINT chk_football_match_current_minute CHECK (
        current_minute IS NULL
        OR current_minute BETWEEN 0 AND 130
    ),
    ADD CONSTRAINT chk_football_match_extra_time CHECK (
        extra_time IS NULL
        OR extra_time >= 0
    );

ALTER TABLE match_event
    ADD CONSTRAINT chk_match_event_minute CHECK (minute BETWEEN 0 AND 130),
    ADD CONSTRAINT chk_match_event_extra_minute CHECK (
        extra_minute IS NULL
        OR extra_minute >= 0
    );

ALTER TABLE event_player
    ADD CONSTRAINT chk_event_player_role CHECK (
        player_event_role IN (
            'MAIN',
            'ASSIST',
            'SUBSTITUTED_IN',
            'SUBSTITUTED_OUT',
            'AFFECTED'
        )
    );

ALTER TABLE match_statistics
    ADD CONSTRAINT chk_match_statistics_possession_home CHECK (
        possession_home IS NULL
        OR possession_home BETWEEN 0 AND 100
    ),
    ADD CONSTRAINT chk_match_statistics_possession_away CHECK (
        possession_away IS NULL
        OR possession_away BETWEEN 0 AND 100
    ),
    ADD CONSTRAINT chk_match_statistics_shots_home CHECK (
        shots_home IS NULL
        OR shots_home >= 0
    ),
    ADD CONSTRAINT chk_match_statistics_shots_away CHECK (
        shots_away IS NULL
        OR shots_away >= 0
    ),
    ADD CONSTRAINT chk_match_statistics_shots_on_target_home CHECK (
        shots_on_target_home IS NULL
        OR shots_on_target_home >= 0
    ),
    ADD CONSTRAINT chk_match_statistics_shots_on_target_away CHECK (
        shots_on_target_away IS NULL
        OR shots_on_target_away >= 0
    ),
    ADD CONSTRAINT chk_match_statistics_corners_home CHECK (
        corners_home IS NULL
        OR corners_home >= 0
    ),
    ADD CONSTRAINT chk_match_statistics_corners_away CHECK (
        corners_away IS NULL
        OR corners_away >= 0
    ),
    ADD CONSTRAINT chk_match_statistics_fouls_home CHECK (
        fouls_home IS NULL
        OR fouls_home >= 0
    ),
    ADD CONSTRAINT chk_match_statistics_fouls_away CHECK (
        fouls_away IS NULL
        OR fouls_away >= 0
    ),
    ADD CONSTRAINT chk_match_statistics_cards CHECK (
        coalesce(yellow_cards_home, 0) >= 0
        AND coalesce(yellow_cards_away, 0) >= 0
        AND coalesce(red_cards_home, 0) >= 0
        AND coalesce(red_cards_away, 0) >= 0
    );

ALTER TABLE data_source
    ADD CONSTRAINT chk_data_source_name_not_blank CHECK (length(trim(name)) > 0),
    ADD CONSTRAINT chk_data_source_type CHECK (
        source_type IN (
            'FOOTBALL_API',
            'AI_SERVICE',
            'MANUAL',
            'INTERNAL'
        )
    );

ALTER TABLE prediction
    ADD CONSTRAINT chk_prediction_home_win_probability CHECK (home_win_probability BETWEEN 0 AND 100),
    ADD CONSTRAINT chk_prediction_draw_probability CHECK (draw_probability BETWEEN 0 AND 100),
    ADD CONSTRAINT chk_prediction_away_win_probability CHECK (away_win_probability BETWEEN 0 AND 100),
    ADD CONSTRAINT chk_prediction_probability_sum CHECK (
        home_win_probability + draw_probability + away_win_probability = 100
    ),
    ADD CONSTRAINT chk_prediction_predicted_home_score CHECK (
        predicted_home_score IS NULL
        OR predicted_home_score >= 0
    ),
    ADD CONSTRAINT chk_prediction_predicted_away_score CHECK (
        predicted_away_score IS NULL
        OR predicted_away_score >= 0
    ),
    ADD CONSTRAINT chk_prediction_confidence_score CHECK (
        confidence_score IS NULL
        OR confidence_score BETWEEN 0 AND 100
    );

ALTER TABLE api_synchronization
    ADD CONSTRAINT chk_api_synchronization_dates CHECK (
        ended_at IS NULL
        OR ended_at >= started_at
    ),
    ADD CONSTRAINT chk_api_synchronization_records_processed CHECK (records_processed >= 0);

CREATE INDEX idx_user_preference_user ON user_preference (id_user);
CREATE INDEX idx_favorite_user ON favorite (id_user);
CREATE INDEX idx_competition_phase_competition ON competition_phase (id_competition);
CREATE INDEX idx_competition_group_phase ON competition_group (id_phase);
CREATE INDEX idx_team_group_team ON team_group (id_team);
CREATE INDEX idx_football_match_home_team ON football_match (id_home_team);
CREATE INDEX idx_football_match_away_team ON football_match (id_away_team);
CREATE INDEX idx_football_match_stadium ON football_match (id_stadium);
CREATE INDEX idx_football_match_status ON football_match (status);
CREATE INDEX idx_team_composition_match ON team_composition (id_match);
CREATE INDEX idx_team_composition_team ON team_composition (id_team);
CREATE INDEX idx_team_composition_player ON team_composition (id_player);
CREATE INDEX idx_event_player_player ON event_player (id_player);
CREATE INDEX idx_prediction_data_source ON prediction (id_data_source);
CREATE INDEX idx_api_synchronization_data_source ON api_synchronization (id_data_source);
