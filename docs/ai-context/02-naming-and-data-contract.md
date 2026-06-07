# LiveKick 2026 - Contrat de nommage et donnees

Ce fichier est la reference principale pour conserver la coherence entre PostgreSQL, migrations SQL, entites JPA, DTO, services, payloads REST et types TypeScript.

## Conventions globales

### SQL

- `snake_case`
- tables au singulier
- colonnes au singulier
- cles primaires prefixees par `id_`
- cles etrangeres explicites

Exemples :

```sql
user
team
player
football_match
```

```sql
id_user
id_team
home_score
away_score
```

### Java

- classes en `PascalCase`
- champs en `camelCase`
- packages par couche et/ou domaine
- enums en `PascalCase`, valeurs en `UPPER_SNAKE_CASE`

Exemples :

```java
User
Team
Player
FootballMatch
```

```java
homeScore
awayScore
currentMinute
```

### TypeScript

- interfaces/types en `PascalCase`
- proprietes en `camelCase`
- enums ou unions alignees sur les valeurs API

Exemples :

```ts
interface FootballMatch {
  homeScore: number
  awayScore: number
  currentMinute: number | null
}
```

## Vocabulaire canonique

Utiliser `FootballMatch`, jamais `Match`, cote Java/TypeScript quand il y a risque de confusion avec un mot reserve ou un concept generique.

Utiliser :

- `User`
- `UserPreference`
- `Notification`
- `Favorite`
- `Competition`
- `CompetitionPhase`
- `CompetitionGroup`
- `Team`
- `Player`
- `TeamGroup`
- `FootballMatch`
- `TeamComposition`
- `MatchEvent`
- `EventPlayer`
- `MatchStatistics`
- `Prediction`
- `DataSource`
- `ApiSynchronization`
- `Stadium`

## User domain

### User

Table : `user`

Champs :

```text
id_user
username
email
email_verified
password_hash
role
registration_date
last_login_date
deletion_date
avatar_url
is_active
gdpr_accepted
gdpr_acceptance_date
gdpr_version_accepted
```

### UserPreference

Table : `user_preference`

Champs :

```text
id_preference
language
theme
notifications_enabled
id_user
```

### Notification

Table : `notification`

Champs :

```text
id_notification
title
message
notification_type
is_read
sent_at
read_at
target_link
id_user
```

### Favorite

Table : `favorite`

Champs :

```text
id_favorite
favorite_type
target_id
added_at
id_user
```

Valeurs `favorite_type` :

```text
TEAM
MATCH
PLAYER
GROUP
STADIUM
```

## Competition domain

### Competition

Table : `competition`

Champs :

```text
id_competition
name
year
host_countries
start_date
end_date
```

### CompetitionPhase

Table : `competition_phase`

Champs :

```text
id_phase
phase_type
display_order
id_competition
```

### CompetitionGroup

Table : `competition_group`

Champs :

```text
id_group
name
display_order
id_phase
```

### Team

Table : `team`

Champs :

```text
id_team
name
fifa_code
country
flag_url
coach_name
world_ranking
```

### Player

Table : `player`

Champs :

```text
id_player
first_name
last_name
birth_date
position
shirt_number
photo_url
id_team
```

### TeamGroup

Table : `team_group`

Champs :

```text
id_team_group
points
wins
draws
losses
goals_for
goals_against
goal_difference
ranking
updated_at
id_team
id_group
```

## Match domain

### FootballMatch

Table : `football_match`

Champs :

```text
id_match
match_date
status
home_score
away_score
current_minute
extra_time
id_home_team
id_away_team
id_stadium
id_phase
```

### TeamComposition

Table : `team_composition`

Champs :

```text
id_composition
is_starting
formation
field_position
id_match
id_team
id_player
```

### MatchEvent

Table : `match_event`

Champs :

```text
id_event
event_type
minute
extra_minute
description
id_match
```

### EventPlayer

Table : `event_player`

Champs :

```text
id_event
id_player
player_event_role
```

### MatchStatistics

Table : `match_statistics`

Champs :

```text
id_statistics
possession_home
possession_away
shots_home
shots_away
shots_on_target_home
shots_on_target_away
corners_home
corners_away
fouls_home
fouls_away
yellow_cards_home
yellow_cards_away
red_cards_home
red_cards_away
id_match
```

## AI domain

### Prediction

Table : `prediction`

Champs :

```text
id_prediction
home_win_probability
draw_probability
away_win_probability
predicted_home_score
predicted_away_score
confidence_score
model_name
explanation
generated_at
id_match
id_data_source
```

## Integration domain

### DataSource

Table : `data_source`

Champs :

```text
id_data_source
name
source_type
base_url
is_active
last_sync_at
```

### ApiSynchronization

Table : `api_synchronization`

Champs :

```text
id_synchronization
synchronization_status
started_at
ended_at
message
records_processed
id_data_source
```

## Stadium domain

### Stadium

Table : `stadium`

Champs :

```text
id_stadium
name
city
country
capacity
latitude
longitude
```

## Relations

```text
User 1 -> 1 UserPreference
User 1 -> N Notification
User 1 -> N Favorite
Competition 1 -> N CompetitionPhase
CompetitionPhase 1 -> N CompetitionGroup
CompetitionGroup 1 -> N TeamGroup
Team 1 -> N Player
Team 1 -> N TeamGroup
FootballMatch N -> 1 Team (home)
FootballMatch N -> 1 Team (away)
FootballMatch N -> 1 Stadium
FootballMatch N -> 1 CompetitionPhase
FootballMatch 1 -> N MatchEvent
FootballMatch 1 -> 0..1 MatchStatistics
FootballMatch 1 -> N TeamComposition
Prediction N -> 1 FootballMatch
Prediction N -> 1 DataSource
ApiSynchronization N -> 1 DataSource
```

## Regles de mapping

### SQL vers Java

```text
football_match -> FootballMatch
id_match -> id
home_score -> homeScore
away_score -> awayScore
current_minute -> currentMinute
id_home_team -> homeTeam
id_away_team -> awayTeam
```

### Java vers TypeScript

```text
FootballMatchDto -> FootballMatch
homeScore -> homeScore
awayScore -> awayScore
currentMinute -> currentMinute
```

### Interdictions

- Ne pas creer `matches`, `users`, `teams` si la convention projet retient le singulier.
- Ne pas melanger `Match`, `FootballMatch`, `Game` et `Fixture`.
- Ne pas exposer `passwordHash` dans une reponse API.
- Ne pas utiliser `fullName` pour `Player` si le modele retient `firstName` et `lastName`.
- Ne pas renommer `fifaCode` en `code` sans decision documentee.
