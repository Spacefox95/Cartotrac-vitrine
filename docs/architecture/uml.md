# Diagramme UML de classes - Cartotrac

Ce diagramme represente les principales classes metier de Cartotrac et leurs relations.

Il met en evidence :
- l'aggregation avec un losange vide `o--` ;
- la composition avec un losange plein `*--` ;
- l'heritage avec `<|--` ;
- les attributs publics `+` et prives `-`.

```mermaid
classDiagram
  direction LR

  class EntitePersistante {
    <<abstract>>
    +int id
    -datetime createdAt
    -datetime updatedAt
    +getId() int
    -touch() void
  }

  class Utilisateur {
    +string email
    +string nomComplet
    +string role
    +boolean estAdmin
    -string motDePasseHash
    +verifierPermission(permission) boolean
    -verifierMotDePasse(motDePasse) boolean
  }

  class Client {
    +string raisonSociale
    +string nomContact
    +string email
    +string telephone
    -string notesInternes
    +mettreAJourCoordonnees() void
  }

  class DemandeDevis {
    +string nom
    +string email
    +string telephone
    +string service
    +string lieu
    +string statut
    -string detailsInternes
    +convertirEnDevis() Devis
  }

  class Devis {
    +string reference
    +string statut
    +decimal totalHT
    +decimal totalTTC
    -decimal margeInterne
    +calculerTotalTTC() decimal
    -calculerMarge() decimal
  }

  class ContexteCadastre {
    +string libelleAdresse
    +string typeRecherche
    +string urlSource
    +float surfaceMesureeM2
    +float surfaceTraceM2
    -string apercuSvg
    +resumerParcelle() string
  }

  class ElementDashboard {
    <<abstract>>
    +string titre
    +string description
    -string commentaireInterne
    +estVisiblePar(utilisateur) boolean
  }

  class TacheDashboard {
    +datetime echeance
    +string statut
    +string priorite
    +int avancement
    -boolean verrouillee
    +marquerTerminee() void
  }

  class EvenementDashboard {
    +datetime debut
    +datetime fin
    +string categorie
    +string lieu
    -string lienPriveReunion
    +deplacer(debut, fin) void
  }

  class NotificationDashboard {
    +string expediteur
    +string message
    +string categorie
    +boolean estLue
    -boolean systeme
    +marquerCommeLue() void
  }

  EntitePersistante <|-- Utilisateur
  EntitePersistante <|-- Client
  EntitePersistante <|-- DemandeDevis
  EntitePersistante <|-- Devis
  EntitePersistante <|-- ElementDashboard

  ElementDashboard <|-- TacheDashboard
  ElementDashboard <|-- EvenementDashboard
  ElementDashboard <|-- NotificationDashboard

  Client "1" o-- "0..*" Devis : possede
  Utilisateur "1" o-- "0..*" ElementDashboard : gere
  DemandeDevis "0..1" o-- "0..1" Devis : genere

  Devis "1" *-- "0..1" ContexteCadastre : contient
  Devis "1" *-- "1..*" LigneDevis : compose

  class LigneDevis {
    +string designation
    +int quantite
    +decimal prixUnitaireHT
    -decimal remiseInterne
    +calculerTotalHT() decimal
  }
```

## Lecture du diagramme

| Concept UML | Exemple dans le diagramme | Sens |
| --- | --- | --- |
| Heritage | `ElementDashboard <|-- TacheDashboard` | Une tache, un evenement et une notification sont des specialisations d'un element de dashboard. |
| Aggregation | `Client o-- Devis` | Un client regroupe des devis, mais les classes gardent leur identite propre. |
| Composition | `Devis *-- ContexteCadastre` | Le contexte cadastre est embarque dans le devis et n'a pas de cycle de vie autonome dans l'application. |
| Attribut public | `+reference` | Attribut expose au reste de l'application. |
| Attribut prive | `-motDePasseHash` | Attribut interne qui ne doit pas etre manipule directement hors de la classe. |

