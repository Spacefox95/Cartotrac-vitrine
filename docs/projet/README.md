# Dossier Projet Cartotrac

Ce dossier assemble les preuves projet les plus utiles pour une presentation technique, un dossier de projet ou une soutenance de type CDA/RNCP.

Il ne remplace pas le code : il aide a relier le besoin, les choix de conception, la qualite logicielle et la mise en production preparee.

Derniere validation technique consolidee dans ce dossier : 24 avril 2026.

## Sommaire

- [Cadrage projet](./cadrage.md)
- [Support de presentation](./support-presentation.md)
- [Conception](./conception.md)
- [Accessibilite](./accessibilite.md)
- [Securite justifiee](./securite.md)
- [Strategie de tests](./tests.md)
- [Validation de deploiement](./deploiement.md)

## Cartographie rapide

| Theme | Piece principale | Appuis techniques |
| --- | --- | --- |
| Presentation | [support-presentation.md](./support-presentation.md) | scenario demo, stack, bilan, annexes code |
| Cadrage | [cadrage.md](./cadrage.md) | `README.md`, pages publiques, parcours contact/devis |
| Conception | [conception.md](./conception.md) | `docs/architecture/*`, backend FastAPI, frontend React |
| Accessibilite | [accessibilite.md](./accessibilite.md) | composants MUI, gardes de routes, formulaires, layouts |
| Securite | [securite.md](./securite.md) | auth JWT, RBAC, bcrypt, CORS, validations, RGPD |
| Tests | [tests.md](./tests.md) | `src/tests/test_rbac_api.py`, lint, type-check, build, CI |
| Deploiement | [deploiement.md](./deploiement.md) | GitHub Actions CI/CD, artefacts, release manifest, SSH deploy |

## References deja presentes dans le depot

- [Architecture backend](../architecture/backend.md)
- [Architecture frontend](../architecture/frontend.md)
- [CI/CD](../architecture/cicd.md)
- [RGPD](../architecture/rgpd.md)
