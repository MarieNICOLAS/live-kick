package com.livekick.Enum;

public enum StatusSynchronisation {
    EN_COURS("En cours"),
    TERMINE("Terminé"),
    ERREUR("Erreur");

    private final String name;

    StatusSynchronisation(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

}
