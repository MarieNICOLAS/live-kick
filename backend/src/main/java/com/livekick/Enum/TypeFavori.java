package com.livekick.Enum;

public enum TypeFavori {
    EQUIPE("Équipe"),
    JOUEUR("Joueur"),
    MATCH("Match"),
    STADE("Stade"),
    GROUPE("Groupe");

    private final String name;

    TypeFavori(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
