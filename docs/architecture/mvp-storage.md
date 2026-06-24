# Stockage du MVP LiveKick

## SQLite

SQLite appartient au backend Spring Boot. Il conserve :

- equipes ;
- joueurs ;
- stades ;
- groupes et classements ;
- matchs ;
- predictions.

Les reponses de l'API Football sont mises a jour dans SQLite. En cas
d'indisponibilite du fournisseur, la derniere version locale sert de repli.

## localStorage

Le frontend conserve localement :

- favoris ;
- theme ;
- langue ;
- fuseau horaire ;
- frequence d'actualisation.

Ces informations ne sont pas sensibles et ne necessitent pas de compte dans le
perimetre MVP.
