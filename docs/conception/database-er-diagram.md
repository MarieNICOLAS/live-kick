# LiveKick 2026 - Diagramme de donnees

Ce diagramme represente le modele de donnees etendu de LiveKick.

Le perimetre fonctionnel valide pour le MVP reste celui du diagramme de cas
d'utilisation. Les entites supplementaires sont conservees pour permettre une
evolution modulaire de l'application.

```mermaid
erDiagram
    User {
        bigint id_user PK
        string username
        string avatar_url
    }

    UserPreference {
        bigint id_preference PK
        bigint id_user FK
        string language
        string theme
        string timezone
    }

    Favorite {
        bigint id_favorite PK
        bigint id_user FK
        string favorite_type
        bigint target_id
        datetime added_at
    }

    DataSource {
        bigint id_data_source PK
        string name
        string source_type
        string base_url
        boolean is_active
        datetime last_sync_at
    }

    ApiSynchronization {
        bigint id_synchronization PK
        bigint id_data_source FK
        datetime started_at
        datetime ended_at
        string synchronization_status
        string message
        int records_processed
    }

    Competition {
        bigint id_competition PK
        string name
        int year
        string host_countries
        date start_date
        date end_date
    }

    CompetitionPhase {
        bigint id_phase PK
        bigint id_competition FK
        string name
        int display_order
        string phase_type
    }

    CompetitionGroup {
        bigint id_group PK
        bigint id_phase FK
        string name
        string group_code
        int display_order
    }

    TeamGroup {
        bigint id_team_group PK
        bigint id_group FK
        bigint id_team FK
        int points
        int wins
        int draws
        int losses
        int goals_for
        int goals_against
        int goal_difference
        int ranking
        datetime updated_at
    }

    Team {
        bigint id_team PK
        string name
        string fifa_code
        string country
        string flag_url
        string coach_name
        int world_ranking
    }

    FootballMatch {
        bigint id_match PK
        bigint id_phase FK
        bigint id_stadium FK
        bigint id_home_team FK
        bigint id_away_team FK
        datetime match_date
        string status
        int home_score
        int away_score
        int current_minute
        int extra_time
    }

    TeamComposition {
        bigint id_composition PK
        bigint id_match FK
        bigint id_team FK
        bigint id_player FK
        string formation
        string field_position
        boolean is_starting
    }

    MatchEvent {
        bigint id_event PK
        bigint id_match FK
        string event_type
        int minute
        int extra_minute
        string description
        datetime created_at
    }

    MatchStatistics {
        bigint id_statistics PK
        bigint id_match FK
        int possession_home
        int possession_away
        int shots_home
        int shots_away
        int shots_on_target_home
        int shots_on_target_away
        int corners_home
        int corners_away
        int fouls_home
        int fouls_away
        int yellow_cards_home
        int yellow_cards_away
        int red_cards_home
        int red_cards_away
        int penalty_score_home
        int penalty_score_away
    }

    Prediction {
        bigint id_prediction PK
        bigint id_match FK
        bigint id_data_source FK
        float home_win_probability
        float draw_probability
        float away_win_probability
        int predicted_home_score
        int predicted_away_score
        float confidence_score
        string explanation
        string model_name
        datetime generated_at
    }

    Stadium {
        bigint id_stadium PK
        string name
        string city
        string country
        int capacity
        float latitude
        float longitude
    }

    Player {
        bigint id_player PK
        bigint id_team FK
        string first_name
        string last_name
        string position
        int shirt_number
        string nationality
        string photo_url
        date birth_date
    }

    Competition ||--|{ CompetitionPhase : contains
    CompetitionPhase ||--o{ CompetitionGroup : contains
    CompetitionPhase ||--o{ FootballMatch : schedules

    CompetitionGroup ||--o{ TeamGroup : has
    Team ||--o{ TeamGroup : participates_in

    Team ||--o{ FootballMatch : home_team
    Team ||--o{ FootballMatch : away_team
    Team ||--o{ Player : has

    Player ||--o{ TeamComposition : selected_in
    Team ||--o{ TeamComposition : fields
    FootballMatch ||--o{ TeamComposition : has

    FootballMatch ||--o{ MatchEvent : has
    FootballMatch ||--o| MatchStatistics : has
    FootballMatch ||--o{ Prediction : receives

    Stadium ||--o{ FootballMatch : hosts

    DataSource ||--o{ ApiSynchronization : tracks
    DataSource ||--o{ Prediction : produces

    User ||--|| UserPreference : configures
    User ||--o{ Favorite : saves
```

## Corrections appliquees

- Conservation de toutes les entites du diagramme transmis.
- Utilisation des noms metier canoniques du projet.
- Utilisation du `snake_case` pour les champs du modele relationnel.
- Suppression du doublon `statut_match` / `status` au profit de `status`.
- Correction des fautes sur les identifiants et scores de tirs au but.
- Distinction explicite des equipes domicile et exterieur d'un match.
- Ajout de la relation entre `Competition` et `CompetitionPhase`.
- Ajout de la source ayant produit une `Prediction`.
- Cardinalite `Team` vers `TeamGroup` rendue compatible avec plusieurs
  competitions ou editions futures.

