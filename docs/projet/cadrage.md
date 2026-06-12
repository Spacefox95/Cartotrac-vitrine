# Cadrage Projet

## Contexte

Cartotrac reunit deux surfaces dans une meme application :

- un site public de presentation et de prise de contact
- un intranet securise pour structurer la relation client et la production commerciale

Le besoin metier visible dans le depot est de mieux relier :

- la qualification initiale d'un besoin terrain
- la recherche cartographique et cadastrale
- la creation d'un devis exploitable
- le suivi commercial interne

Ce positionnement apparait dans le `README`, dans les pages publiques `About`, `Services`, `Contact`, `QuoteRequest` et dans le parcours intranet `cadastre -> devis`.

## Probleme a resoudre

Avant Cartotrac, le cycle de travail cible peut facilement se disperser entre emails, notes, outils cartographiques, fichiers temporaires et documents commerciaux. Le projet vise a reduire cette fragmentation en fournissant un socle unique pour :

- centraliser l'information utile au devis
- securiser les acces internes
- conserver le contexte cadastral rattache a une proposition commerciale
- rendre le suivi client et devis plus lisible

## Utilisateurs cibles

### Utilisateurs externes

- prospect qui cherche un premier contact
- client qui veut exposer un besoin ou demander un devis

### Utilisateurs internes

- `admin` : administration et supervision
- `manager` : pilotage commercial et gestion client/devis
- `sales` : consultation clients et production de devis
- `viewer` : consultation en lecture seule

## Objectifs produit

- Presenter clairement l'offre Cartotrac sur la partie publique
- Fournir un espace connecte avec authentification reelle
- Gérer clients, devis, tableaux de bord et planning interne
- Ajouter un module carto/cadastre utile au cadrage du devis
- Poser un socle extensible pour les briques futures annoncees dans le projet

## Perimetre fonctionnel actuel

### Dans le perimetre

- site public avec pages vitrines et pages legales
- authentification via API backend
- controle d'acces par roles et permissions
- CRUD clients
- CRUD devis
- export PDF de devis
- tableau de bord interne
- administration des utilisateurs
- recherche d'adresse, geocodage inverse, recherche cadastrale et estimation d'emprise batie

### Hors perimetre a ce stade

- facturation
- comptabilite
- application mobile
- observabilite avancee
- cookie banner complet
- audit RGAA formel
- mecanisme de session `HttpOnly`
- demonstration NoSQL

## Contraintes de realisation

- architecture separee frontend/backend
- backend Python/FastAPI avec PostgreSQL
- frontend React/TypeScript avec Vite et MUI
- deploiement prepare autour de GitHub Actions et d'un transfert SSH
- budget technique volontairement simple sur la V1

## Criteres de reussite retenus

- un prospect comprend la proposition de valeur et trouve un point d'entree simple
- un utilisateur interne authentifie accede uniquement a ce que son role autorise
- un devis peut etre cree, consulte, modifie, exporte en PDF
- le contexte cadastral peut etre exploite dans le cycle devis
- le projet est buildable, testable et packageable pour un deploiement

## Risques projet identifies

- sur-promesse produit si les briques futures sont presentees comme deja livrees
- dette de securite si la V1 reste en `localStorage` et avec un secret non durci en production
- dette d'accessibilite si aucun audit navigateur/reel n'est mene
- dette de tests si seuls les parcours RBAC sont verifies automatiquement

## Positionnement pour un dossier de projet

Cartotrac constitue un projet credible de niveau concepteur-developpeur car il articule :

- besoin metier explicite
- parcours utilisateur differencies
- architecture multicouche
- securisation des acces
- modelisation de donnees et migrations
- industrialisation CI/CD

Le point a tenir en soutenance est de presenter honnetement le niveau reel de maturite : V1 structuree et exploitable, mais pas encore produit totalement durci ou certifie accessibilite.
