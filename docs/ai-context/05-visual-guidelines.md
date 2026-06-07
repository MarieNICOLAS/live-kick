# LiveKick 2026 - Guide visuel

## Positionnement

LiveKick doit donner une impression sportive, premium, mondiale et temps reel.

Mots cles :

- football ;
- live ;
- intelligence ;
- clarte ;
- premium ;
- rapidite ;
- confiance.

Eviter :

- style Vite/React starter ;
- UI generique sans identite ;
- surcharge decorative ;
- couleurs non conformes ;
- pages marketing quand une interface utile est attendue.

## Palette

Les couleurs du dossier projet etaient parfois espacees dans le document source. Les valeurs ci-dessous sont normalisees.

### Dark mode

| Role | Nom | Hex |
| --- | --- | --- |
| Background | Deep Navy | `#07111F` |
| Elevated | Dark Surface | `#0D1B2A` |
| Surface | Surface Navy | `#14263A` |
| Primary Text | White | `#F8FAFC` |
| Secondary Text | Light Gray | `#C7D2DA` |
| Muted Text | Muted Gray | `#8FA1B3` |
| Disabled Text | Disabled Gray | `#6B6B7A` |

### Light mode

| Role | Nom | Hex |
| --- | --- | --- |
| Background | Light Background | `#F8FAFC` |
| Elevated | White | `#FFFFFF` |
| Surface | Light Surface | `#EEF2F7` |
| Primary Text | Dark Navy | `#111827` |
| Secondary Text | Slate Gray | `#4B5563` |
| Muted Text | Cool Gray | `#9CA3AF` |
| Disabled Text | Light Disabled | `#D1D5DB` |

### Accents

| Role | Nom | Hex |
| --- | --- | --- |
| Primary Accent | Electric Cyan | `#00D4FF` |
| Warning | Amber | `#F5B942` |
| Success | Green | `#22C55E` |
| Danger | Red | `#EF4444` |
| Secondary Accent | Purple | `#8B5CF6` |

## Tokens CSS recommandes

```css
:root {
  --lk-bg: #07111f;
  --lk-elevated: #0d1b2a;
  --lk-surface: #14263a;
  --lk-text-primary: #f8fafc;
  --lk-text-secondary: #c7d2da;
  --lk-text-muted: #8fa1b3;
  --lk-accent: #00d4ff;
  --lk-warning: #f5b942;
  --lk-success: #22c55e;
  --lk-danger: #ef4444;
  --lk-purple: #8b5cf6;
}
```

## Typographie

Typographie cible : `Inter`.

Fallback :

```css
font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Regles :

- titres courts et lisibles ;
- textes denses mais scannables ;
- pas de lettres serrees negativement ;
- taille adaptee aux dashboards sportifs ;
- eviter les blocs marketing trop grands dans les interfaces metier.

## Composants attendus

- `MatchCard`
- `LiveBadge`
- `Scoreboard`
- `TeamFlag`
- `GroupStandingTable`
- `PredictionPanel`
- `ProbabilityBar`
- `TimelineEvent`
- `FavoriteButton`
- `StatusBadge`
- `AdminDataTable`

## Regles de composition

- Prioriser score, equipe, statut, minute.
- Afficher les donnees live avec contraste et lisibilite.
- Utiliser les badges pour les statuts : `SCHEDULED`, `LIVE`, `FINISHED`, `POSTPONED`.
- Utiliser `Electric Cyan` pour l'action principale et les elements live.
- Utiliser `Green`, `Amber`, `Red` pour feedbacks et alertes.
- Garder les cards avec rayon modere, maximum `8px`, sauf exception systeme.
- Ne pas empiler des cards dans des cards.

## Responsive

Approche mobile-first :

- liste des matchs lisible sur mobile ;
- score et statut toujours visibles ;
- tableaux de classement scrollables si necessaire ;
- navigation simple ;
- aucun texte ne doit deborder de son composant.

## Accessibilite

- Contraste suffisant entre texte et fond.
- Boutons avec etats focus visibles.
- Images d'equipes/drapeaux avec `alt` utile.
- Ne pas transmettre une information uniquement par la couleur.
- Labels explicites sur les champs de formulaire.

## A eviter absolument

- Reutiliser le template Vite par defaut.
- Changer la palette sans raison.
- Utiliser `Match` partout si le contrat dit `FootballMatch`.
- Mettre une page d'accueil purement marketing au lieu d'une experience utile.
- Cacher les donnees sportives importantes sous de grandes illustrations.
