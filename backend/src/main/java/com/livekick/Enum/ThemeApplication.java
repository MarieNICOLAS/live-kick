package com.livekick.Enum;

public enum ThemeApplication {
    DARK("Dark"),
    LIGHT("Light"),
    SYSTEM("Système");
    // On peut rajouter autant de thème de couleurs

    private final String name;

    ThemeApplication(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
