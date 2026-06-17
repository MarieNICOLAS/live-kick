package com.livekick.Enum;

public enum StatusMatch {
    PROGRAMME("Programmé", "PRG", 1),
    EN_COURS("En cours", "ENC", 2),
    TERMINE("Terminé", "TRM", 3),
    ANNULE("Annulé", "ANL", 4),
    REPORTE("Reporté", "RPT", 5),
    SUSPENDU("Suspendu", "SUS", 6);

    // Attributs finaux
    private final String name; // Long nom
    private final String short_name; // Nom d'affichage petit
    private final int order; // Order (d'affichage notamment)

    // Constructeur de l'enum
    StatusMatch(String name, String short_name, int order) {
        this.name = name;
        this.short_name = short_name;
        this.order = order;
    }

    // Getters
    public String getName() {
        return name;
    }

    public String getShortName() {
        return short_name;
    }

    public int getOrder() {
        return order;
    }
}
