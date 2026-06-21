package com.livekick.Enum;

public enum PosteJoueur {
    GARDIEN("Gardien", "G", 1),
    DEFENSEUR("Défenseur", "D", 2),
    MILIEU("Milieu", "M", 3),
    ATTAQUANT("Attaquant", "A", 4);

    // Attributs finaux
    private final String name; // Long nom
    private final String short_name; // Nom d'affichage petit
    private final int order; // Order (d'affichage notamment)

    // Constructeur de l'enum
    PosteJoueur(String name, String short_name, int order) {
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
