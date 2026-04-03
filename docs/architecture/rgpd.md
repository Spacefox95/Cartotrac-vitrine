# RGPD Cartotrac

Ce document complete les pages publiques du frontend et sert de checklist projet pour une mise en production plus robuste sur le plan RGPD.

## Deja couvert dans l'application

- Page publique de politique de confidentialite
- Page publique de politique de cookies
- Page publique de mentions legales avec champs restant a completer
- Mentions d'information ajoutees sur les parcours `contact`, `demande de devis` et `connexion`
- Transparence sur les stockages locaux identifies dans le frontend :
  - `cartotrac.accessToken` dans `localStorage`
  - `cartotrac.cadastre.quoteDraft` dans `sessionStorage`

## Points restant a finaliser avant publication publique

- Completer l'identite legale de l'editeur :
  - raison sociale
  - forme juridique
  - adresse du siege
  - SIREN / RCS
  - directeur de publication
- Completer l'identite de l'hebergeur :
  - denomination
  - adresse
  - contact
- Lister les sous-traitants reels utilises en production :
  - hebergement
  - email
  - monitoring
  - sauvegardes
- Verifier les durees d'archivage reellement appliquees cote base de donnees et support
- Prevoir une procedure de reponse aux demandes d'exercice de droits
- Documenter la procedure de suppression ou d'anonymisation des comptes internes desactives

## Vigilances techniques

- Le jeton d'authentification est actuellement conserve dans `localStorage`.
- Ce choix peut etre acceptable pour un prototype ou une V1 interne, mais il augmente l'exposition en cas de faille XSS.
- Pour une mise en production sensible, envisager un mecanisme plus robuste de session serveur ou de cookie `HttpOnly` securise selon l'architecture retenue.

## Cookies et consentement

- Aucun traceur de mesure d'audience ou marketing n'a ete identifie dans l'audit du frontend realise dans ce depot.
- Si un outil non essentiel est ajoute plus tard, il faudra mettre en place un bandeau de consentement conforme avant depot des traceurs.
- Le refus devra etre propose aussi simplement que l'acceptation.
