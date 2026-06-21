package com.livekick.Enum;


public enum PhaseMatch {
    PHASE_GROUPE("Phase de groupe", "GRP", 1),
    SEIZIEME("Seizième de finale", "1/16", 2),
    HUITIEME("Huitième de finale", "1/8", 3),
    QUART("Quart de finale", "1/4", 4),
    DEMI("Demi-finale", "1/2", 5),
    FINALE("Finale", "FIN", 6);

    // Attributs finaux
    private final String name; // Long nom
    private final String short_name; // Nom d'affichage petit
    private final int order; // Order (d'affichage notamment)

    // Constructeur de l'enum
    PhaseMatch(String name, String short_name, int order) {
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