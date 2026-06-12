package com.livekick.Enum;

public enum TypeClassement {
    BUTS("Buts", "BUT", 1),
    PASSES_DECISIVES("Passes décisives", "PD", 2),
    CARTONS_JAUNES("Cartons jaunes", "CJ", 3), // Icon ?
    CARTONS_ROUGES("Cartons rouges", "CR", 4); // Icon ?

    // Attributs finaux
    private final String name; // Long nom
    private final String short_name; // Nom d'affichage petit
    private final int order; // Order (d'affichage notamment)

    // Constructeur de l'enum
    TypeClassement(String name, String short_name, int order) {
        this.name = name;
        this.short_name = short_name;
        this.order = order;
    }

    // Getters pour accéder aux propriétés
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
