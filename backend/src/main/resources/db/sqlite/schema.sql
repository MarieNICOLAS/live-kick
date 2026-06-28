PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS team (
    id_team INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    fifa_code TEXT,
    country TEXT,
    flag_url TEXT,
    group_code TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player (
    id_player INTEGER PRIMARY KEY,
    id_team INTEGER NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    position TEXT,
    shirt_number INTEGER,
    nationality TEXT,
    photo_url TEXT,
    birth_date TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_team) REFERENCES team (id_team)
);

CREATE TABLE IF NOT EXISTS stadium (
    id_stadium INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    fifa_name TEXT,
    city TEXT,
    country TEXT,
    capacity INTEGER,
    region TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competition_group (
    group_code TEXT PRIMARY KEY,
    display_order INTEGER,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_group (
    group_code TEXT NOT NULL,
    id_team INTEGER NOT NULL,
    matches_played INTEGER,
    wins INTEGER,
    draws INTEGER,
    losses INTEGER,
    points INTEGER,
    goals_for INTEGER,
    goals_against INTEGER,
    goal_difference INTEGER,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_code, id_team),
    FOREIGN KEY (group_code) REFERENCES competition_group (group_code),
    FOREIGN KEY (id_team) REFERENCES team (id_team)
);

CREATE TABLE IF NOT EXISTS football_match (
    id_match INTEGER PRIMARY KEY,
    match_date TEXT,
    status TEXT NOT NULL,
    phase TEXT,
    phase_type TEXT,
    group_code TEXT,
    matchday INTEGER,
    home_score INTEGER,
    away_score INTEGER,
    current_minute INTEGER,
    id_home_team INTEGER,
    id_away_team INTEGER,
    id_stadium INTEGER,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_home_team) REFERENCES team (id_team),
    FOREIGN KEY (id_away_team) REFERENCES team (id_team)
);

CREATE TABLE IF NOT EXISTS prediction (
    id_prediction INTEGER PRIMARY KEY AUTOINCREMENT,
    id_match INTEGER NOT NULL,
    home_win_probability REAL NOT NULL CHECK (home_win_probability BETWEEN 0 AND 100),
    draw_probability REAL NOT NULL CHECK (draw_probability BETWEEN 0 AND 100),
    away_win_probability REAL NOT NULL CHECK (away_win_probability BETWEEN 0 AND 100),
    predicted_home_score INTEGER NOT NULL CHECK (predicted_home_score >= 0),
    predicted_away_score INTEGER NOT NULL CHECK (predicted_away_score >= 0),
    confidence_score REAL NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    model_name TEXT NOT NULL,
    explanation TEXT,
    generated_at TEXT NOT NULL,
    FOREIGN KEY (id_match) REFERENCES football_match (id_match)
);

CREATE INDEX IF NOT EXISTS idx_player_team ON player (id_team);
CREATE INDEX IF NOT EXISTS idx_match_phase ON football_match (phase);
CREATE INDEX IF NOT EXISTS idx_match_group ON football_match (group_code);
CREATE INDEX IF NOT EXISTS idx_match_status ON football_match (status);
CREATE INDEX IF NOT EXISTS idx_prediction_match ON prediction (id_match);
CREATE INDEX IF NOT EXISTS idx_match_home_team ON football_match (id_home_team);
CREATE INDEX IF NOT EXISTS idx_match_away_team ON football_match (id_away_team);
CREATE INDEX IF NOT EXISTS idx_match_date ON football_match (match_date);
