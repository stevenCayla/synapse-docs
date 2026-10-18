---
title: QA
description: Stratégie de test de Synapse Medical — tests PHPUnit, exécution,
  couverture, recette manuelle avant release et état de la CI.
slug: 3.0/qa/readme
---

> 🌐 Version française · [English version](/3.0/en/qa/readme/)

La qualité de Synapse Medical repose sur deux piliers : une **suite de tests
unitaires PHPUnit** qui verrouille les règles critiques (contrôle d'accès,
isolation par workspace, chiffrement, politique de mots de passe, sessions), et
une **recette manuelle** déroulée avant chaque release pour les parcours de bout
en bout.

## Pages de cette section

| Page | Contenu |
|------|---------|
| [Checklist de recette QA — Security](/3.0/qa/security-checklist/) | Recette détaillée des paramètres de sécurité : sessions, modale d'avertissement, verrouillage, mots de passe… |

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

* **`tests/bootstrap.php`** charge `vendor/autoload.php` puis `Dotenv::bootEnv()`
  sur `.env` : les fichiers `.env`, `.env.local`, `.env.test` et
  `.env.test.local` sont lus selon la cascade habituelle de Symfony.
* **`.env.test`** ne définit que `KERNEL_CLASS` et un `APP_SECRET` de test.
* **Base de données de test** : `config/packages/doctrine.yaml` ajoute le suffixe
  `_test` au nom de la base en environnement `test` (plus `TEST_TOKEN` avec
  ParaTest). Les tests actuels n'y accèdent pas, mais c'est la base à utiliser
  pour vérifier les migrations (voir [Processus de release](/3.0/deployment/release-process/#vérifier-les-migrations-sur-une-base-vierge)).
* Les tests tournent dans le conteneur `php` de **développement** : l'image de
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

:::tip[Écrire un nouveau test]
Placer le test dans le répertoire miroir de la classe testée
(`src/Security/Voter/XxxVoter.php` → `tests/Security/XxxVoterTest.php`). Tout
nouveau voter ou service manipulant des ressources métier doit comporter au
moins un test **« ressource d'un autre workspace → refus »**, conformément à la
règle d'isolation stricte par workspace.
:::

## Intégration continue

| Contrôle | Exécuté en CI ? |
|----------|-----------------|
| Build des images Docker (cible dev) + démarrage | Oui (job **Tests**) |
| Accessibilité HTTP et hub Mercure | Oui (**Tests**) |
| Création de la base de test + migrations | Oui (**Tests**) |
| **PHPUnit** | Oui (**Tests**) |
| php-cs-fixer, PHPStan (niveau 6, avec baseline), Rector | Oui (job **Quality**) |
| `composer audit` | Oui (job **Security**, quand `composer.json` ou `composer.lock` change ; audit hebdomadaire `dependency-audit.yaml`) |
| Lint (`super-linter/slim`) | Oui (**Lint**) |
| **`doctrine:schema:validate`** | Oui (**Tests**, sur la base issue des migrations) |

Sur une Pull Request qui ne touche que `docs/**` ou des fichiers `*.md`, le job
**Tests** est sauté (job **Changes**) ; **Lint** tourne toujours.

:::note[Avant une release]
La CI couvre les tests et l'analyse statique, mais pas les parcours complets :
dérouler aussi la checklist de recette manuelle ci-dessous.
:::

## Checklist de recette manuelle

À dérouler avant chaque release, sur un environnement alimenté par le jeu de
données de test (`make seed`), avec au moins **deux workspaces** et des
utilisateurs de rôles différents. Pour les paramètres de sécurité en détail, voir
la [checklist de recette Security](/3.0/qa/security-checklist/).

### Authentification

* \[ ] Connexion identifiant / mot de passe, puis saisie du code TOTP.
* \[ ] Un utilisateur sans TOTP configuré est redirigé vers `/2fa/setup`.
* \[ ] Code TOTP invalide refusé ; verrouillage après le nombre d'échecs configuré.
* \[ ] Changement de mot de passe forcé appliqué quand il est exigé ; la politique de mot de passe est respectée.
* \[ ] Expiration de session après inactivité : modale d'avertissement puis déconnexion.

### Isolation par workspace

* \[ ] Changer de workspace recharge entièrement les listes, filtres et tableaux de bord.
* \[ ] Aucune étude, aucun patient ni aucun document du workspace A n'apparaît dans le workspace B.
* \[ ] Saisir dans l'URL l'identifiant d'une ressource d'un autre workspace → **403 ou 404**.
* \[ ] Une ressource créée est rattachée au workspace actif.

### Études et eCRF

* \[ ] Un `viewer` ne peut rien modifier ; un `manager` gère patients et données ; un `admin` gère l'étude.
* \[ ] Saisie eCRF : première saisie sans motif ; toute **modification** d'une valeur existante exige un motif de modification (*reason for change*).
* \[ ] Le motif et les valeurs avant / après apparaissent dans l'historique d'audit.
* \[ ] Une étude gelée n'accepte plus de saisie.
* \[ ] Ouverture et clôture d'une query sur un champ.
* \[ ] Signature électronique d'un formulaire.

### Exports

* \[ ] Export des données d'étude (CSV / Excel) : contenu cohérent avec l'écran.
* \[ ] Un utilisateur restreint à un centre n'exporte que les patients de son centre.
* \[ ] L'export est tracé dans le journal d'activité.

### Fichiers privés

* \[ ] Avatar, pièces jointes feedback et documents cliniques servis via `/private/...` uniquement.
* \[ ] Une URL `/private/clinical/{token}` ouverte par un utilisateur sans accès à l'étude → refus.
* \[ ] Aucun fichier uploadé accessible sous `public/`.
* \[ ] Une image uploadée ne contient plus de métadonnées EXIF.

### Après déploiement

* \[ ] La version affichée (page de connexion, pied de page) correspond à `APP_VERSION`.
* \[ ] Smoke-test de production décrit dans le [Processus de release](/3.0/deployment/release-process/#7-déployer-sur-le-serveur).

## Voir aussi

* [Processus de release](/3.0/deployment/release-process/) · [Déploiement en production](/3.0/deployment/production/)
* [Checklist de recette QA — Security](/3.0/qa/security-checklist/)
* [Guide de contribution](/3.0/contribute/)
