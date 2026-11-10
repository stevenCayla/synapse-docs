---
title: "QA"
description: "Stratégie de test de Synapse Medical — tests PHPUnit, exécution, couverture, recette manuelle avant release et état de la CI."
---

> 🌐 Version française · [English version](/en/qa/readme/)

La qualité de Synapse Medical repose sur deux piliers : une **suite de tests
unitaires PHPUnit** qui verrouille les règles critiques (contrôle d'accès,
isolation par workspace, chiffrement, politique de mots de passe, sessions), et
une **recette manuelle** déroulée avant chaque release pour les parcours de bout
en bout.

## Pages de cette section

| Page | Contenu |
|------|---------|
| [Checklist de recette QA — Security](/qa/security-checklist/) | Recette détaillée des paramètres de sécurité : sessions, modale d'avertissement, verrouillage, mots de passe… |
| [Recette d'une étude d'ophtalmologie](/qa/recette-ophtalmologie/) | Recette pas à pas pour un ophtalmologue : assistant de création d'étude, import par œil, saisie œil par œil, discordance, signature, exports de test |

## Organisation des tests

Les tests se trouvent dans `tests/` et reprennent l'arborescence de `src/` :

| Répertoire | Ce qui est testé | Exemples |
|------------|------------------|----------|
| `tests/Controller/` | Logique extraite des contrôleurs | `EcrfReasonForChangeTest` (détection d'une modification nécessitant un motif), `SessionExpireControllerTest` |
| `tests/Entity/` | Règles métier portées par les entités | `StudyFreezeTest`, `PatientConsentTest`, `StudyRoleTest`, `SiteRoleTest`, `StudySiteTest` |
| `tests/Enum/` | Énumérations et transitions d'état | `StudyPatientStatusTest`, `StudySiteStatusTransitionTest`, `EcrfQueryStatusTest` |
| `tests/EventListener/` | Listeners Doctrine | `TotpEncryptionListenerTest` (chiffrement des secrets TOTP) |
| `tests/EventSubscriber/` | Subscribers du kernel | `SessionInactivitySubscriberTest` |
| `tests/Security/` | Voters et politique de sécurité | `StudyVoterTest`, `PatientVoterTest`, `EcrfRecordVoterTest`, `PasswordPolicyServiceTest`, `SecuritySettingsProviderTest` |
| `tests/Service/` | Services applicatifs | `StudyAccessServiceTest`, `SiteAccessServiceTest`, `EncryptionServiceTest`, `StudyExportServiceTest`, `MatchIdServiceTest`, `WorkspaceModuleManagerTest` |
| `tests/Repository/` | *(vide pour l'instant)* | — |

La suite compte **27 classes de test**. Toutes étendent
`PHPUnit\Framework\TestCase` : ce sont des **tests unitaires purs**, sans
démarrage du kernel Symfony ni base de données. Les dépendances (repositories,
`Security`, `RequestStack`, horloge…) sont remplacées par des mocks.

:::note[Pas encore de tests fonctionnels]
Il n'existe aujourd'hui ni `WebTestCase`, ni `KernelTestCase`, ni fixtures de
test. Les parcours HTTP complets (formulaires, redirections, templates) sont
couverts uniquement par la [recette manuelle](#checklist-de-recette-manuelle).
:::

## Ce qui est couvert

| Domaine | Classes de test | Garanties vérifiées |
|---------|-----------------|---------------------|
| **Isolation par workspace** | `StudyVoterTest`, `PatientVoterTest`, `EcrfRecordVoterTest` | Une ressource d'un autre workspace est refusée, y compris pour un super-admin ; refus en l'absence de workspace actif |
| **Contrôle d'accès aux études** | `StudyVoterTest`, `StudyAccessServiceTest`, `StudyRoleTest` | Rôles `viewer` / `manager` / `admin`, propriétaire = admin, non-membre refusé, cache par requête |
| **Restriction par centre investigateur** | `SiteAccessServiceTest`, `SiteAccessPatientEnforcementTest`, `StudyExportServiceTest` | Un utilisateur restreint à un centre ne voit ni n'exporte les patients d'autres centres |
| **Politique de mots de passe** | `PasswordPolicyServiceTest`, `SecuritySettingsProviderTest` | Longueur minimale, majuscule, minuscule, chiffre, caractère spécial, paramètres configurables |
| **Chiffrement** | `EncryptionServiceTest`, `TotpEncryptionListenerTest` | Validation de la clé, chiffrement / déchiffrement des PII et des secrets TOTP, idempotence, compatibilité avec les valeurs legacy en clair, rejet d'une mauvaise clé |
| **Sessions** | `SessionInactivitySubscriberTest`, `SessionExpireControllerTest` | Expiration après inactivité côté serveur, routes exclues, invalidation de session journalisée |
| **eCRF** | `EcrfReasonForChangeTest`, `EcrfQueryStatusTest`, `EcrfRecordVoterTest` | Motif de modification exigé uniquement en cas de changement réel, cycle de vie des queries, enregistrements verrouillés |
| **Cycle de vie** | `StudyFreezeTest`, `StudyPatientStatusTest`, `StudySiteStatusTransitionTest`, `PatientConsentTest`, `PatientTest` | Gel / dégel d'étude, transitions de statut autorisées, consentement patient, calcul de l'âge |
| **Modules et intégrations** | `WorkspaceModuleManagerTest`, `MatchIdServiceTest` | Activation des modules par workspace ; cycle de vie du jeton de l'API MatchID (registre des décès) |

## Configuration PHPUnit

Le fichier `phpunit.dist.xml` (PHPUnit 13) est volontairement strict :

| Paramètre | Valeur | Effet |
|-----------|--------|-------|
| `failOnDeprecation` | `true` | Toute dépréciation fait échouer la suite |
| `failOnNotice` | `true` | Toute notice PHP fait échouer la suite |
| `failOnWarning` | `true` | Tout warning fait échouer la suite |
| `bootstrap` | `tests/bootstrap.php` | Charge l'autoloader et les variables d'environnement |
| `APP_ENV` | `test` (forcé) | Environnement Symfony de test |
| `SHELL_VERBOSITY` | `-1` | Sortie console silencieuse |
| `error_reporting` | `-1` | Toutes les erreurs sont remontées |
| `<source>` | `src/` | Périmètre d'analyse des dépréciations et de la couverture |
| `restrictNotices` / `restrictWarnings` | `true` | Seules les notices / warnings émis depuis `src/` sont pris en compte |
| `ignoreIndirectDeprecations` | `true` | Les dépréciations internes aux dépendances sont ignorées |

Les dépréciations Doctrine (`Doctrine\Deprecations\Deprecation::trigger`) et
Symfony (`trigger_deprecation`) sont déclarées comme déclencheurs : une API
dépréciée appelée depuis `src/` casse donc la suite.

## Environnement de test

- **`tests/bootstrap.php`** charge `vendor/autoload.php` puis `Dotenv::bootEnv()`
  sur `.env` : les fichiers `.env`, `.env.local`, `.env.test` et
  `.env.test.local` sont lus selon la cascade habituelle de Symfony.
- **`.env.test`** ne définit que `KERNEL_CLASS` et un `APP_SECRET` de test.
- **Base de données de test** : `config/packages/doctrine.yaml` ajoute le suffixe
  `_test` au nom de la base en environnement `test` (plus `TEST_TOKEN` avec
  ParaTest). Les tests actuels n'y accèdent pas, mais c'est la base à utiliser
  pour vérifier les migrations (voir [Processus de release](/deployment/release-process/#vérifier-les-migrations-sur-une-base-vierge)).
- Les tests tournent dans le conteneur `php` de **développement** : l'image de
  production n'embarque ni `tests/` ni les dépendances `require-dev`.

## Lancer les tests

```bash
make test                                        # toute la suite
make test c="--filter StudyVoterTest"            # une classe
make test c="--filter testRejectsStudyFromDifferentWorkspace"   # un test
make test c="tests/Security"                     # un répertoire
make test c="--stop-on-failure --testdox"        # s'arrêter au premier échec, sortie lisible
```

Sans Make :

```bash
docker compose exec -e APP_ENV=test php bin/phpunit
```

### Exécution parallèle (par PR)

```bash
make test-parallel                               # 8 processus (PROCS=8 par défaut)
make test-parallel PROCS=12 c="--filter Wizard"  # autre nombre de processus, options paratest/PHPUnit
```

`make test-parallel` lance [ParaTest](https://github.com/paratestphp/paratest) : une base par processus
(`app_test1`, `app_test2`…, via `TEST_TOKEN`, créées et migrées à chaque appel) et un répertoire temporaire
par processus (`tests/parallel-prepend.php`). Le compte de tests et d'assertions est identique à l'exécution
série (1999 tests, 11795 assertions), en environ 2 minutes au lieu de 7 à 11 (machine de 16 cœurs, chargée).

Règle : le parallèle sert à valider **une PR** ; l'exécution série (`make test`) reste la référence et reste
**obligatoire** pour la vérification complète sur `develop` après un lot de fusions. Un échec en parallèle se
rejoue en série avant de conclure. L'ordre aléatoire (`--order-by=random`) n'est pas supporté : la suite
contient des dépendances d'ordre préexistantes, qui échouent aussi en série avec la même graine.

:::tip[Écrire un nouveau test]
Placer le test dans le répertoire miroir de la classe testée
(`src/Security/Voter/XxxVoter.php` → `tests/Security/XxxVoterTest.php`). Tout
nouveau voter ou service manipulant des ressources métier doit comporter au
moins un test **« ressource d'un autre workspace → refus »**, conformément à la
règle d'isolation stricte par workspace.
:::

## Tests de bout en bout (Playwright)

Une suite `@playwright/test` (Chromium) pilote l'application dans un vrai
navigateur : `tests/e2e/` (`package.json`, `playwright.config.ts`, `specs/`,
`support/`). Elle couvre :

- la première connexion (configuration 2FA, codes de secours, changement de mot
  de passe forcé, seconde connexion avec un code TOTP) ;
- la connexion avec un code de secours, puis le refus du même code ;
- un test de fumée des pages principales (accueil, étude, patients, membres,
  centres, eCRF, utilisateurs, matrice d'accès, modèles eCRF et aperçu,
  paramètres de sécurité, profil) : HTTP 200, aucune erreur console, aucune
  violation de la Content Security Policy ;
- l'ajout et la modification d'un membre d'étude, la création d'un eCRF depuis
  zéro et depuis un modèle.

Tout message d'erreur de la console ou de la CSP fait échouer le test en cours.

```bash
make up                  # la pile de développement doit tourner (https://localhost)
make e2e                 # installe les dépendances et Chromium au besoin, puis lance la suite
make e2e c="--headed"    # options Playwright
```

La suite **réinitialise la base** (`app:seed --reset`) avec le super-administrateur
`e2e.admin@example.com` : ne la lancer que sur un environnement jetable.
La suite refuse de démarrer sans `CI` ou `E2E_ALLOW_RESET=1` ; `make e2e` affiche
le projet Compose et l'URL de base, puis attend que l'on tape `yes`.
Variables : `E2E_BASE_URL` (défaut `https://localhost`), `E2E_ALLOW_RESET=1`
(confirme la réinitialisation), `E2E_SKIP_SEED=1`
(ne pas réinitialiser la base, pour relancer un seul projet avec `--no-deps`),
`E2E_OUTPUT_DIR` (rapport HTML et traces, par défaut un dossier temporaire :
ils sont écrits hors de l'arborescence, car le rechargement à chaud de
FrankenPHP rechargerait les pages à chaque image écrite).

### Lancer la suite de façon fiable

La pile de développement surveille les fichiers (`FRANKENPHP_WORKER_CONFIG=watch`,
`FRANKENPHP_SITE_CONFIG=hot_reload`) : à chaque fichier PHP, Twig, YAML ou image modifié
sous `/app`, FrankenPHP redémarre ses threads PHP et recharge toutes les pages ouvertes.
Pendant une exécution, cela ferme la fenêtre de l'assistant ou recharge une page au milieu
d'une étape, et le test échoue sans raison (mesuré : une modification de fichier toutes les
2 s fait échouer 3 exécutions sur 8 du test 11, 9 sur 10 du test « progress » de 33). Une édition, un changement de branche, un
`cache:clear` ou une reconstruction du cache suffisent.

Pour un test fiable, lancer la suite sur une pile jetable **sans surveillance**, avec le fichier
`compose.e2e.yaml` (opt-in, jamais chargé par défaut ; la pile de développement habituelle et la
production ne changent pas) :

```bash
export COMPOSE_PROJECT_NAME=synapse-e2e IMAGES_PREFIX=e2e- HTTP_PORT=24080 HTTPS_PORT=24443 HTTP3_PORT=24443
export COMPOSE_FILE=compose.yaml:compose.override.yaml:compose.e2e.yaml
docker compose up -d --wait
E2E_BASE_URL=https://localhost:24443 E2E_OUTPUT_DIR=/tmp/e2e-out make e2e
```

Un script fait tout cela d'une seule façon, depuis un worktree git lié (jamais le checkout principal) : `bin/verify up`
recrée la pile à partir d'un volume neuf (jamais de worker périmé), `bin/verify check --phpunit=parallel --e2e=none|<specs>|full` enchaîne
les contrôles du moins coûteux au plus coûteux (changelog, `git diff --check`, `make qa`, migrations, schéma, OpenAPI,
PHPUnit, E2E) et écrit un rapport (étape, durée, journal, commit testé, verdict) ; `bin/verify down` retire la pile, ses
images et, avec `--worktree`, le worktree. Le mode PHPUnit (`parallel` par PR, `serial` fait référence : seul `serial` avec `--e2e=full` donne le verdict complet) et le périmètre E2E sont toujours explicites, chaque exécution E2E repart d'un seed
neuf, et un périmètre partiel ou une étape non exécutée n'est jamais présenté comme un succès (code de sortie 3).

Sans surveillance, le code est lu au démarrage des workers : après une modification du code,
`docker compose restart php worker` (le `worker` Messenger n'est jamais rechargé à chaud). Ne pas modifier les
fichiers de l'arborescence pendant l'exécution. La suite affiche un avertissement si la pile surveille encore ses
fichiers. Les tests du sélecteur de profil (`38-profile-switcher`) ne s'exécutent qu'avec
`APP_ENVIRONMENT_LABEL=local APP_PROFILE_SWITCHER=1` dans l'environnement de la pile.

**Quelle exécution, quand** (aucune CI ne tourne sur les Pull Requests vers `develop`, tout est vérifié en local) :

- Par Pull Request : PHPUnit complet, `make qa`, migrations et `doctrine:schema:validate`, `make openapi` sans écart, et
  **seulement les specs E2E concernées**.
- La suite E2E **complète** s'ajoute quand la PR touche les données de démonstration ou les commandes de seed, les
  gabarits de mise en page ou partagés, la connexion ou la session, l'assistant de création d'étude, ou le code et la
  configuration de support des E2E (un changement de seed a déjà cassé des specs que la PR ne touchait pas).
- Une exécution complète sur `develop` après chaque lot de fusions. Si `develop` est rouge, plus rien n'est fusionné
  avant son retour au vert.
- Après avoir fusionné `develop` dans une branche, ou modifié un gestionnaire de messages, recréer la pile ou lancer
  `docker compose restart php worker` : un worker périmé a déjà produit un faux échec. Après la résolution d'un conflit
  de fusion, relire le diff par rapport à `develop` avant de pousser. `retries` reste à 0 dans Playwright.

**Écrire des specs rapides** (là où part le temps d'une exécution) :

- Une connexion passe par `submitCredentials` (`support/login.ts`), qui demande au navigateur la préférence « réduire
  les animations » : la page de connexion saute alors son onde d'une seconde et plus avant d'envoyer le formulaire. La
  première connexion (`01-first-login`) garde l'animation.
- Le serveur ne retient pas les codes TOTP déjà utilisés : `currentTotp` (`support/totp.ts`) donne le code de la fenêtre
  courante et n'attend la suivante que dans les trois dernières secondes d'une fenêtre. Si le serveur refuse un jour de
  rejouer un code, c'est ici qu'il faudra attendre la fenêtre suivante.
- Une capture d'écran est prise à la fin de chaque test (`screenshot: 'only-on-failure'`) : si le test s'arrête juste
  après une navigation, elle attend jusqu'à 5 s les polices d'une page à moitié chargée. La fixture `problems`
  (`support/fixtures.ts`) laisse donc la page finir de charger avant la fin du test.
- Un `waitForTimeout` n'est acceptable que pour une pause que le test veut observer (un enregistrement automatique qui
  ne doit pas partir, le délai d'un anti-rebond) ; sinon, attendre la condition (réponse réseau, texte, état).
- Le nettoyage de données (par exemple les brouillons) ne passe par l'écran que si l'écran est ce que le test vérifie.

Un nouveau test `NN-….spec.ts` est exécuté sans autre réglage : le projet `wizard` prend tous les tests
que les autres projets (`first-login`, `app`, `backup-code`, `public-pages`) ne réclament pas. Les tests partagent
un compte : ne pas renuméroter, l'ordre des fichiers compte.

## Intégration continue

| Contrôle | Exécuté en CI ? |
|----------|-----------------|
| Build des images Docker (cible dev) + démarrage | Oui (job **Tests**) |
| Accessibilité HTTP et hub Mercure | Oui (**Tests**) |
| Création de la base de test + migrations | Oui (**Tests**) |
| **PHPUnit** | Oui (**Tests**) |
| **Tests de bout en bout Playwright** (navigateur, aucune erreur console ni violation CSP) | Oui (job **E2E** ; rapport HTML et traces en artefact en cas d'échec) |
| php-cs-fixer, PHPStan (niveau 6, avec baseline), Rector | Oui (job **Quality**) |
| `composer audit` | Oui (job **Security**, quand `composer.json` ou `composer.lock` change ; audit hebdomadaire `dependency-audit.yaml`) |
| Lint (`super-linter/slim`) | Oui (**Lint**) |
| **`doctrine:schema:validate`** | Oui (**Tests**, sur la base issue des migrations) |

Sur une Pull Request qui ne touche que `docs/**` ou des fichiers `*.md`, les jobs
**Tests** et **E2E** sont sautés (job **Changes**) ; **Lint** tourne toujours.

Pour limiter les minutes GitHub Actions consommées :

- **Tests** et **E2E** sont sautés tant que la Pull Request est en **brouillon** ; ils démarrent quand elle est
  marquée prête (`gh pr ready`) et restent exigés avant la fusion, qui est refusée pour un brouillon.
- Un nouveau push annule l'exécution en cours de la même Pull Request.
- **Lint** ne vérifie que les fichiers modifiés sur une Pull Request, et toute la base de code sur un push vers
  `develop` ou `main`.
- Le cache de build Docker est écrit par les pushs vers `develop` et `main` (qui n'exécutent pas **Quality**
  sur `develop`) et seulement lu par les Pull Requests.

:::note[Avant une release]
La CI couvre les tests, l'analyse statique et quelques parcours navigateur, mais pas tous les parcours :
dérouler aussi la checklist de recette manuelle ci-dessous.
:::

## Checklist de recette manuelle

À dérouler avant chaque release, sur un environnement alimenté par le jeu de
données de test (`make seed`), avec au moins **deux workspaces** et des
utilisateurs de rôles différents. Pour les paramètres de sécurité en détail, voir
la [checklist de recette Security](/qa/security-checklist/).

### Authentification

- [ ] Connexion identifiant / mot de passe, puis saisie du code TOTP.
- [ ] Un utilisateur sans TOTP configuré est redirigé vers `/2fa/setup`.
- [ ] Code TOTP invalide refusé ; verrouillage après le nombre d'échecs configuré.
- [ ] Changement de mot de passe forcé appliqué quand il est exigé ; la politique de mot de passe est respectée.
- [ ] Expiration de session après inactivité : modale d'avertissement puis déconnexion.

### Isolation par workspace

- [ ] Changer de workspace recharge entièrement les listes, filtres et tableaux de bord.
- [ ] Aucune étude, aucun patient ni aucun document du workspace A n'apparaît dans le workspace B.
- [ ] Saisir dans l'URL l'identifiant d'une ressource d'un autre workspace → **403 ou 404**.
- [ ] Une ressource créée est rattachée au workspace actif.

### Études et eCRF

- [ ] Un `viewer` ne peut rien modifier ; un `manager` gère patients et données ; un `admin` gère l'étude.
- [ ] Saisie eCRF : première saisie sans motif ; toute **modification** d'une valeur existante exige un motif de modification (*reason for change*).
- [ ] Le motif et les valeurs avant / après apparaissent dans l'historique d'audit.
- [ ] Une étude gelée n'accepte plus de saisie.
- [ ] Ouverture et clôture d'une query sur un champ.
- [ ] Signature électronique d'un formulaire.

### Exports

- [ ] Export des données d'étude (CSV / Excel) : contenu cohérent avec l'écran.
- [ ] Un utilisateur restreint à un centre n'exporte que les patients de son centre.
- [ ] L'export est tracé dans le journal d'activité.
- [ ] Étude en Configuration : l'export des données de test (page de configuration, bloc « Données de test ») ne contient que les patients de test, le nom du fichier contient `TEST` et la dernière colonne indique TEST ; refusé une fois l'étude en cours ; les exports normaux ne contiennent aucun patient de test.

### Fichiers privés

- [ ] Avatar, pièces jointes feedback et documents cliniques servis via `/private/...` uniquement.
- [ ] Une URL `/private/clinical/{token}` ouverte par un utilisateur sans accès à l'étude → refus.
- [ ] Aucun fichier uploadé accessible sous `public/`.
- [ ] Une image uploadée ne contient plus de métadonnées EXIF.

### Après déploiement

- [ ] La version affichée (page de connexion, pied de page) correspond au tag git du build (`vX.Y.Z`, ou `vX.Y.Z-N-gsha` entre deux tags).
- [ ] Smoke-test de production décrit dans le [Processus de release](/deployment/release-process/#7-déployer-sur-le-serveur).

## Voir aussi

- [Processus de release](/deployment/release-process/) · [Déploiement en production](/deployment/production/)
- [Checklist de recette QA — Security](/qa/security-checklist/)
- [Guide de contribution](/contribute/)
