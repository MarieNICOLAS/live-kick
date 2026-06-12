package com.livekick.Enum;

public enum TypeEvenement {
    BUT("But"),
    PENALTY("Pénalty"),
    CSC("CSC"),
    CARTON_JAUNE("Carton Jaune"),
    CARTON_ROUGE("Carton Rouge"),
    REMPLACEMENT("Remplacement"),
    VAR("VAR"),
    DEBUT_MATCH("Début du match"),
    MI_TEMPS("Mi-temps"),
    FIN_MATCH("Fin du match"),
    PROLONGATION("Prolongation"),
    TIR_AU_BUT("Tir au but");

    private final String name;

    TypeEvenement(String name) {
        this.name = name;
    }
    public String getName() {
        return name;
    }
}
