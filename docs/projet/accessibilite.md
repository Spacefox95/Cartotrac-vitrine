# Accessibilite

## Positionnement de cette piece

Ce document constitue une preuve de prise en compte de l'accessibilite a partir d'une revue statique du code et de l'architecture du projet au 24 avril 2026.

Il ne pretend pas etablir une conformite RGAA complete. C'est un pre-audit technique utile pour montrer :

- ce qui est deja favorable a l'accessibilite
- ce qui reste a verifier en navigation reelle
- ce qu'il faudra produire pour une validation formelle

## Points favorables identifies

### Composants standards et etiquetes

Les formulaires principaux s'appuient sur des composants MUI standard avec labels visibles :

- `LoginForm`
- `ClientForm`
- `QuoteForm`

Ce point est favorable a l'association champ/libelle et a la lisibilite des formulaires.

### Retours d'erreur visibles

Les erreurs de saisie et d'action sont affichees via `Alert` ou via des messages de validation. Cela contribue a une meilleure comprehension des echecs utilisateurs.

### Navigation protegee mais lisible

Les gardes de routes distinguent :

- utilisateur non authentifie
- chargement de session
- utilisateur authentifie

Le comportement est explicite et limite les etats incoherents.

### Responsive design present

Les pages publiques et plusieurs ecrans MUI utilisent des breakpoints `xs/md`, ce qui va dans le bon sens pour l'adaptation multi-ecrans.

## Limites et points a traiter

### Audit clavier non demontre

Le depot ne contient pas encore de preuve de parcours complet au clavier sur :

- les menus
- le login
- les formulaires clients/devis
- le module cadastre

### Absence de preuve outillee

Je n'ai pas trouve dans le projet :

- test `axe`
- rapport Lighthouse accessibilite
- grille RGAA renseignee
- procedure de recette accessibilite

### Landmarks et navigation d'evitement

Le depot ne documente pas encore :

- lien d'evitement vers le contenu principal
- strategie de focus visible
- revue de la hierarchie exacte des titres page par page

### Contrastes et contenus specifiques

Les contrastes, les etats `hover/focus`, la carte cadastral/carto et les contenus dynamiques du dashboard doivent encore etre verifies dans un navigateur reel avec outils de mesure.

## Niveau de preuve actuel

### Ce qui peut etre affirme

- le projet utilise des composants d'interface plutot favorables a une base accessible
- les formulaires ont des labels visibles
- les erreurs et etats de chargement sont traites
- la prise en compte du sujet est documentable

### Ce qui ne doit pas etre affirme

- conformite RGAA
- conformite WCAG
- accessibilite validee sur parcours reel

## Plan d'action recommande

1. Ajouter une recette manuelle accessibilite sur les parcours `login`, `clients`, `quotes`, `cadastre`.
2. Executer un audit navigateur avec Lighthouse et/ou axe sur les ecrans principaux.
3. Ajouter un lien d'evitement et verifier les landmarks `header/main/footer/nav`.
4. Documenter les contrastes et le focus visible dans le theme.
5. Conserver une grille de preuves avec captures et anomalies corrigees.

## Formulation defendable en soutenance

Cartotrac montre une prise en compte initiale de l'accessibilite par le choix de composants standards, de formulaires etiquetes et d'etats utilisateurs explicites. En revanche, le projet n'a pas encore fait l'objet d'un audit RGAA outille et doit etre presente comme pre-audite, pas comme conforme.
