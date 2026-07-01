package com.livekick.mapper;

import com.livekick.dto.football.CompetitionGroupDto;
import com.livekick.dto.football.FootballMatchDto;
import com.livekick.dto.football.GroupStandingDto;
import com.livekick.dto.football.PlayerDto;
import com.livekick.dto.football.StadiumDto;
import com.livekick.dto.football.TeamDto;
import com.livekick.dto.football.TeamFormMatchDto;
import com.livekick.dto.football.TeamStatisticsDto;
import com.livekick.dto.football.TeamSummaryDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static java.util.Map.entry;

@Component
public class FrenchFootballLabelMapper {

    private static final Pattern WINNER_MATCH_PATTERN = Pattern.compile("^Winner Match (\\d+)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern LOSER_MATCH_PATTERN = Pattern.compile("^Loser Match (\\d+)$", Pattern.CASE_INSENSITIVE);

    private static final Map<String, String> TEAM_NAME_BY_FIFA_CODE = Map.ofEntries(
            entry("ALG", "Algérie"),
            entry("ARG", "Argentine"),
            entry("AUS", "Australie"),
            entry("AUT", "Autriche"),
            entry("BEL", "Belgique"),
            entry("BIH", "Bosnie-Herzégovine"),
            entry("BRA", "Brésil"),
            entry("CAN", "Canada"),
            entry("CIV", "Côte d'Ivoire"),
            entry("COD", "République démocratique du Congo"),
            entry("COL", "Colombie"),
            entry("CPV", "Cap-Vert"),
            entry("CRO", "Croatie"),
            entry("CUW", "Curaçao"),
            entry("CZE", "République tchèque"),
            entry("ECU", "Équateur"),
            entry("EGY", "Égypte"),
            entry("ENG", "Angleterre"),
            entry("ESP", "Espagne"),
            entry("FRA", "France"),
            entry("GER", "Allemagne"),
            entry("GHA", "Ghana"),
            entry("HAI", "Haïti"),
            entry("IRN", "Iran"),
            entry("IRQ", "Irak"),
            entry("JOR", "Jordanie"),
            entry("JPN", "Japon"),
            entry("KOR", "Corée du Sud"),
            entry("KSA", "Arabie saoudite"),
            entry("MAR", "Maroc"),
            entry("MEX", "Mexique"),
            entry("NED", "Pays-Bas"),
            entry("NOR", "Norvège"),
            entry("NZL", "Nouvelle-Zélande"),
            entry("PAN", "Panama"),
            entry("PAR", "Paraguay"),
            entry("POR", "Portugal"),
            entry("QAT", "Qatar"),
            entry("RSA", "Afrique du Sud"),
            entry("SCO", "Écosse"),
            entry("SEN", "Sénégal"),
            entry("SUI", "Suisse"),
            entry("SWE", "Suède"),
            entry("TUN", "Tunisie"),
            entry("TUR", "Turquie"),
            entry("URU", "Uruguay"),
            entry("USA", "États-Unis"),
            entry("UZB", "Ouzbékistan")
    );

    private static final Map<String, String> COUNTRY_BY_RAW_NAME = Map.ofEntries(
            entry("algeria", "Algérie"),
            entry("argentina", "Argentine"),
            entry("australia", "Australie"),
            entry("austria", "Autriche"),
            entry("belgium", "Belgique"),
            entry("bosnia and herzegovina", "Bosnie-Herzégovine"),
            entry("brazil", "Brésil"),
            entry("canada", "Canada"),
            entry("colombia", "Colombie"),
            entry("cape verde", "Cap-Vert"),
            entry("côte d'ivoire", "Côte d'Ivoire"),
            entry("croatia", "Croatie"),
            entry("curaçao", "Curaçao"),
            entry("curaã§ao", "Curaçao"),
            entry("curaãƒâ§ao", "Curaçao"),
            entry("czech republic", "République tchèque"),
            entry("democratic republic of the congo", "République démocratique du Congo"),
            entry("ecuador", "Équateur"),
            entry("egypt", "Égypte"),
            entry("england", "Angleterre"),
            entry("france", "France"),
            entry("french", "Française"),
            entry("germany", "Allemagne"),
            entry("ghana", "Ghana"),
            entry("haiti", "Haïti"),
            entry("iran", "Iran"),
            entry("iraq", "Irak"),
            entry("ivory coast", "Côte d'Ivoire"),
            entry("japan", "Japon"),
            entry("jordan", "Jordanie"),
            entry("korea republic", "Corée du Sud"),
            entry("mexico", "Mexique"),
            entry("morocco", "Maroc"),
            entry("netherlands", "Pays-Bas"),
            entry("new zealand", "Nouvelle-Zélande"),
            entry("norway", "Norvège"),
            entry("portugal", "Portugal"),
            entry("qatar", "Qatar"),
            entry("saudi arabia", "Arabie saoudite"),
            entry("scotland", "Écosse"),
            entry("senegal", "Sénégal"),
            entry("south africa", "Afrique du Sud"),
            entry("south korea", "Corée du Sud"),
            entry("spain", "Espagne"),
            entry("sweden", "Suède"),
            entry("switzerland", "Suisse"),
            entry("tunisia", "Tunisie"),
            entry("turkey", "Turquie"),
            entry("united states", "États-Unis"),
            entry("uruguay", "Uruguay"),
            entry("uzbekistan", "Ouzbékistan")
    );

    private static final Map<Long, String> STADIUM_NAME_BY_ID = Map.ofEntries(
            entry(1L, "Stade Banorte"),
            entry(2L, "Stade Akron"),
            entry(3L, "Stade BBVA"),
            entry(4L, "Stade BMO"),
            entry(5L, "Stade BC Place"),
            entry(6L, "Stade Mercedes-Benz"),
            entry(7L, "Stade Levi's"),
            entry(8L, "Stade SoFi"),
            entry(9L, "Stade Gillette"),
            entry(10L, "Stade MetLife"),
            entry(11L, "Stade Lincoln Financial Field"),
            entry(12L, "Stade Hard Rock"),
            entry(13L, "Stade NRG"),
            entry(14L, "Stade Arrowhead"),
            entry(15L, "Stade AT&T"),
            entry(16L, "Stade Lumen")
    );

    private static final Map<Long, String> FIFA_STADIUM_NAME_BY_ID = Map.ofEntries(
            entry(1L, "Stade de Mexico"),
            entry(2L, "Stade de Guadalajara"),
            entry(3L, "Stade de Monterrey"),
            entry(4L, "Stade de Toronto"),
            entry(5L, "Stade de Vancouver"),
            entry(6L, "Stade d'Atlanta"),
            entry(7L, "Stade de la baie de San Francisco"),
            entry(8L, "Stade de Los Angeles"),
            entry(9L, "Stade de Boston"),
            entry(10L, "Stade de New York New Jersey"),
            entry(11L, "Stade de Philadelphie"),
            entry(12L, "Stade de Miami"),
            entry(13L, "Stade de Houston"),
            entry(14L, "Stade de Kansas City"),
            entry(15L, "Stade de Dallas"),
            entry(16L, "Stade de Seattle")
    );

    private static final Map<String, String> STADIUM_NAME_BY_RAW_NAME = Map.ofEntries(
            entry("arrowhead stadium", "Stade Arrowhead"),
            entry("at&t stadium", "Stade AT&T"),
            entry("bc place", "Stade BC Place"),
            entry("bmo field", "Stade BMO"),
            entry("estadio akron", "Stade Akron"),
            entry("estadio banorte", "Stade Banorte"),
            entry("estadio bbva", "Stade BBVA"),
            entry("gillette stadium", "Stade Gillette"),
            entry("hard rock stadium", "Stade Hard Rock"),
            entry("levi's stadium", "Stade Levi's"),
            entry("lincoln financial field", "Stade Lincoln Financial Field"),
            entry("lumen field", "Stade Lumen"),
            entry("mercedes-benz stadium", "Stade Mercedes-Benz"),
            entry("metlife stadium", "Stade MetLife"),
            entry("nrg stadium", "Stade NRG"),
            entry("sofi stadium", "Stade SoFi")
    );

    private static final Map<String, String> CITY_BY_RAW_NAME = Map.ofEntries(
            entry("mexico city", "Mexico"),
            entry("new york/new jersey (east rutherford)", "New York/New Jersey (East Rutherford)"),
            entry("philadelphia", "Philadelphie"),
            entry("san francisco bay area (santa clara)", "Baie de San Francisco (Santa Clara)")
    );

    public TeamDto localize(TeamDto team) {
        if (team == null) {
            return null;
        }

        return new TeamDto(
                team.id(),
                translateTeamName(team.fifaCode(), team.name()),
                team.fifaCode(),
                translateCountry(team.country()),
                team.flagUrl(),
                team.groupCode()
        );
    }

    public TeamSummaryDto localize(TeamSummaryDto team) {
        if (team == null) {
            return null;
        }

        return new TeamSummaryDto(
                team.id(),
                translateTeamName(team.fifaCode(), team.name()),
                team.fifaCode(),
                team.flagUrl()
        );
    }

    public StadiumDto localize(StadiumDto stadium) {
        if (stadium == null) {
            return null;
        }

        return new StadiumDto(
                stadium.id(),
                translateStadiumName(stadium.id(), stadium.name()),
                translateFifaStadiumName(stadium.id(), stadium.fifaName()),
                translateCity(stadium.city()),
                translateCountry(stadium.country()),
                stadium.capacity(),
                stadium.region()
        );
    }

    public PlayerDto localize(PlayerDto player) {
        if (player == null) {
            return null;
        }

        return new PlayerDto(
                player.id(),
                player.teamId(),
                player.firstName(),
                player.lastName(),
                player.position(),
                player.shirtNumber(),
                translateCountry(player.nationality()),
                player.photoUrl(),
                player.birthDate()
        );
    }

    public FootballMatchDto localize(FootballMatchDto match) {
        if (match == null) {
            return null;
        }

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
                localize(match.homeTeam()),
                localize(match.awayTeam()),
                match.stadiumId()
        );
    }

    public CompetitionGroupDto localize(CompetitionGroupDto group) {
        if (group == null) {
            return null;
        }

        List<GroupStandingDto> standings = group.standings() == null
                ? List.of()
                : group.standings().stream().map(this::localize).toList();

        return new CompetitionGroupDto(group.code(), group.displayOrder(), standings);
    }

    public TeamStatisticsDto localize(TeamStatisticsDto statistics) {
        if (statistics == null) {
            return null;
        }

        List<TeamFormMatchDto> recentForm = statistics.recentForm() == null
                ? List.of()
                : statistics.recentForm().stream().map(this::localize).toList();

        return new TeamStatisticsDto(
                statistics.id(),
                localize(statistics.team()),
                statistics.matchesPlayed(),
                statistics.wins(),
                statistics.draws(),
                statistics.losses(),
                statistics.goalsFor(),
                statistics.goalsAgainst(),
                statistics.goalDifference(),
                statistics.winRate(),
                statistics.averageGoalsFor(),
                statistics.averageGoalsAgainst(),
                recentForm
        );
    }

    private GroupStandingDto localize(GroupStandingDto standing) {
        if (standing == null) {
            return null;
        }

        return new GroupStandingDto(
                localize(standing.team()),
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

    private TeamFormMatchDto localize(TeamFormMatchDto match) {
        if (match == null) {
            return null;
        }

        return new TeamFormMatchDto(
                match.matchId(),
                match.matchDate(),
                localize(match.opponent()),
                match.home(),
                match.teamScore(),
                match.opponentScore(),
                match.result()
        );
    }

    private String translateTeamName(String fifaCode, String rawName) {
        String code = normalizeFifaCode(fifaCode);
        if (code != null && TEAM_NAME_BY_FIFA_CODE.containsKey(code)) {
            return TEAM_NAME_BY_FIFA_CODE.get(code);
        }

        String translatedName = translate(rawName, COUNTRY_BY_RAW_NAME);
        if (translatedName != null) {
            return translatedName;
        }

        return translatePlaceholderTeamName(rawName);
    }

    private String translateCountry(String rawCountry) {
        String translatedCountry = translate(rawCountry, COUNTRY_BY_RAW_NAME);
        return translatedCountry == null ? rawCountry : translatedCountry;
    }

    private String translateStadiumName(Long stadiumId, String rawName) {
        if (stadiumId != null && STADIUM_NAME_BY_ID.containsKey(stadiumId)) {
            return STADIUM_NAME_BY_ID.get(stadiumId);
        }

        String translatedName = translate(rawName, STADIUM_NAME_BY_RAW_NAME);
        return translatedName == null ? rawName : translatedName;
    }

    private String translateFifaStadiumName(Long stadiumId, String rawName) {
        if (stadiumId != null && FIFA_STADIUM_NAME_BY_ID.containsKey(stadiumId)) {
            return FIFA_STADIUM_NAME_BY_ID.get(stadiumId);
        }

        return translateStadiumName(null, rawName);
    }

    private String translateCity(String rawCity) {
        String translatedCity = translate(rawCity, CITY_BY_RAW_NAME);
        return translatedCity == null ? rawCity : translatedCity;
    }

    private String translatePlaceholderTeamName(String rawName) {
        if (rawName == null) {
            return null;
        }

        Matcher winnerMatcher = WINNER_MATCH_PATTERN.matcher(rawName);
        if (winnerMatcher.matches()) {
            return "Vainqueur du match " + winnerMatcher.group(1);
        }

        Matcher loserMatcher = LOSER_MATCH_PATTERN.matcher(rawName);
        if (loserMatcher.matches()) {
            return "Perdant du match " + loserMatcher.group(1);
        }

        return rawName;
    }

    private String translate(String rawValue, Map<String, String> translations) {
        String key = normalize(rawValue);
        return key == null ? null : translations.get(key);
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeFifaCode(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim().toUpperCase(Locale.ROOT);
    }
}
