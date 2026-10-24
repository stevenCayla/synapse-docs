# Changelog

Toutes les modifications notables de **Synapse Medical** sont consignées dans ce fichier.

Le format est basé sur [Keep a Changelog 1.1.0](https://keepachangelog.com/fr/1.1.0/), et le
projet suit le [Semantic Versioning](https://semver.org/lang/fr/) (`MAJOR.MINOR.PATCH`).

Chaque version publiée correspond à une [GitHub Release](https://github.com/stevenCayla/SYNAPSE-MEDICAL/releases) (tag `vX.Y.Z`). La section
`[Unreleased]` regroupe les changements fusionnés sur `develop` mais pas encore publiés.

## [Unreleased]

### ⚠️ À vérifier avant déploiement

- **Rôle de base de données applicatif `app_runtime`** (#155) : l'application ne se connecte plus avec `POSTGRES_USER` (superutilisateur par défaut, qui ignore la sécurité par ligne) mais avec un rôle restreint ; le propriétaire ne sert plus qu'aux migrations. Sans `POSTGRES_APP_PASSWORD`, `compose.prod.yaml` refuse de démarrer. Étapes (détails : `docs/deployment/production.md`) :
  1. sauvegarder la base, ajouter `POSTGRES_APP_PASSWORD` à `.env.local` (`openssl rand -hex 24`), puis `docker compose -f compose.yaml -f compose.prod.yaml up -d database` ;
  2. créer le rôle : `docker compose -f compose.yaml -f compose.prod.yaml exec -T database sh /docker-entrypoint-initdb.d/10-create-app-role.sh` ;
  3. déployer (`up -d` : la migration `Version20261022100000` accorde les droits DML au rôle) ;
  4. vérifier : `docker compose -f compose.yaml -f compose.prod.yaml exec php php bin/console dbal:run-sql "select rolname, rolsuper, rolbypassrls from pg_roles where rolname = current_user"` doit répondre `app_runtime | f | f`.
- **Sécurité par ligne fermée** (#155, migration `Version20261022110000`, suite du point précédent) : avec le rôle `app_runtime`, une requête SQL manuelle ou un script sans `set_config('app.workspace_id', …)` ne voit plus aucune ligne de `study`, `patient`, `ecrf_record` ; la maintenance se fait avec le propriétaire (`psql -U $POSTGRES_USER`). Aucune action sur l'application elle-même.

- **Nouvelle clé `APP_FILE_ENCRYPTION_KEY`** (#90) : chiffre l'archive des imports de données appliqués (`private_uploads/arc/`). Obligatoire en production : `compose.prod.yaml` refuse de démarrer sans elle.
  Générer : `php -r "echo base64_encode(random_bytes(32));"`, l'ajouter à `.env.local` avec les autres clés, la conserver dans le coffre et la sauvegarder séparément : sans elle l'archive est illisible. En développement elle est générée au premier démarrage.
  Recréer le worker (`up -d --force-recreate worker`) pour qu'il applique les imports. La migration `Version20261022120000` élargit `study_patient.subject_id` à 64 caractères.

### Security

- **Invitation d'un compte existant** (#238) : accepter une invitation ne modifie plus jamais les rôles globaux du compte ; un membre de A invité administrateur de B ne devenait pas seulement admin de B mais aussi de A (listes d'utilisateurs, organisations, matrice d'accès).
- Les routes `/users/{id}/…` (réinitialisation 2FA, révocation des sessions, déblocage, modification, e-mail de mot de passe) ne s'appliquent plus qu'à un membre du workspace actif par l'Owner (jamais un administrateur de plateforme) ; la fiche utilisateur et les volets d'accès restent limités aux membres du workspace actif (#234).
- L'Owner d'un workspace reçoit `ROLE_ADMIN` et non plus le rôle de plateforme `ROLE_SUPER_ADMIN` : ses droits viennent de son rôle `WorkspaceUser`, vérifié sur le workspace de la ressource, et il n'agit plus sur un autre workspace. Après déploiement, rétrograder les anciens Owner avec `app:security:workspace-owner-roles` (`docs/deployment/production.md`) (#224).
- La sécurité par ligne PostgreSQL (3 tables) échoue fermée : un `app.workspace_id` vide ou absent n'affiche aucune ligne (avant : toutes), sauf bypass explicite `app.rls_bypass` ouvert par l'unique assistant `RowLevelSecurity` (transaction, restauré, journalisé). Le worker d'import positionne le workspace du message ; seed, rétention et impact des packs ouvrent un bypass audité (#155).
- L'application se connecte à PostgreSQL avec un rôle restreint (`app_runtime` : ni propriétaire, ni superuser, ni `BYPASSRLS`, DML seulement) : les politiques de sécurité par ligne (`study`, `patient`, `ecrf_record`) s'appliquent enfin, même sous `FORCE ROW LEVEL SECURITY` ; migrations et maintenance passent par une connexion propriétaire absente du serveur web et du worker (#155).

### Added

- **Fonction à l'invitation** (#219) : la fonction se choisit (facultative) dans la fenêtre d'invitation, avec le tiroir « Gérer les fonctions » ; elle est posée sur le membre à l'acceptation (le champ disparaît du formulaire) et n'est plus modifiable depuis « Mon profil » ; les propriétaires et administrateurs l'assignent depuis le tiroir utilisateur (`PUT /job-titles/members/{id}`).
- **Fonction sur les invitations de l'assistant** (#222) : chaque invitation de l'étape Équipe peut porter une fonction du workspace (liste facultative, tiroir « Gérer les fonctions » pour les propriétaires et administrateurs), copiée sur l'invitation au lancement et appliquée à l'acceptation ; une fonction archivée ou d'un autre workspace est refusée. Migration `Version20261024160000`.

- Tiroir de gestion des fonctions du workspace (#218) : liste, ajout, renommage en ligne, archivage, restauration et suppression (409 : archivage proposé si la fonction est utilisée), ouvert de toute page par `data-job-titles-drawer` (bouton de la page Utilisateurs, propriétaires et administrateurs) ; l'événement `jobtitles:changed` transmet la liste à jour et la fonction créée.
- Fonctions propres à chaque workspace (#217) : entité `JobTitle` (nom unique sans tenir compte de la casse, archivage), lien optionnel sur le membre et l'invitation, points d'accès JSON réservés au propriétaire et aux admins du workspace (suppression refusée en 409 si utilisée), fonction Twig `user_job_title()` ; la migration reprend `user.job_title` (conservé).
- Tests de bout en bout de l'assistant d'étude (#91) : parcours prospectif Essentiel avec import signé appliqué par le worker, mode Avancé (ratio invalide refusé, multi-cohortes RIPH 3), parcours rétrospectif (seuil k, source inchangée), checklist jusqu'à la mise en production (deux signataires, patient de test purgé) ; matrice PHPUnit des règles de l'import.
- **Import** : « Conserver » les données identifiantes est autorisé selon la base réglementaire de l'étude (dossier réglementaire et moteur de règles, règles portées par les packs) : activé ou grisé avec sa raison et un lien vers l'étape réglementaire, revérifié à la signature et à l'application, base et catégories conservées tracées dans le résumé signé (#171)
- **Application de l'import au lancement de l'étude** (#90) : un import signé est appliqué par le worker, par lots d'une transaction (curseur, reprise après le dernier lot, idempotent). Patients réels (pas des données de recette, conservés à la mise en production), numéro de sujet = identifiant du fichier,
  visites, formulaires et valeurs sans jamais écraser (conflit = requête), une requête par avertissement accepté. Audit : une entrée par valeur (chaîne d'intégrité valide), corrections avant → après, lignes exclues avec leur règle, résumé signé et entrée `import.applied`.
  Aucune valeur identifiante n'est enregistrée par défaut ; le fichier téléversé est supprimé et remplacé par une archive chiffrée expurgée (SHA-256 de l'original conservé).
- Site d'inclusion des patients importés (#90) : la confirmation demande le site par défaut quand l'étude en a plusieurs ouverts (choix enregistré dans la session et couvert par la signature, site d'une autre étude ou d'un autre workspace refusé côté serveur) ; une colonne « Site » du fichier (code ou nom, sans casse ni accent) donne son site à chaque ligne, valeur inconnue = erreur remplaçable.
- **Import de données en quatre sous-étapes** (#89) : l'étape Import de l'assistant (prospectif et rétrospectif) et la page Patients › Importer proposent fichier (glisser-déposer, 50 Mo, modèle CSV généré depuis les champs eCRF, réglages de lecture, plage de données, colonnes identifiantes exclues
  par défaut dont la date de naissance), rapprochement des colonnes (notes, groupes de couleur, suffixe → visite, définition de nouveaux champs), contrôles (remplacer, accepter, exclure, corriger, compteurs, lecture par le worker avec barre de progression) et confirmation signée. Le fichier est
  archivé directement dans le stockage privé ; « Continuer » reste bloqué tant qu'un import n'est pas validé ou annulé (règle serveur) ; le Récapitulatif affiche l'import validé. L'application des données à l'étude relève de #90. `upload_max_filesize` passe à 50 Mo.
- Fiche d'étude imprimable (#122) : depuis la revue de l'assistant (prospectif et rétrospectif, modes Essentiel et Avancé) et depuis la checklist de configuration d'une étude créée ; identité, design (bras, cohortes, randomisation), cadre et catégorie avec correction motivée, exigences réglementaires par pays avec statut, sites, calendrier visites × formulaires, équipe et tous
  les points ouverts avec leur gravité ; impression ou PDF par le navigateur, feuille de style d'impression claire, sans bibliothèque ni ressource externe ; brouillon réservé à son propriétaire, étude créée réservée à ses administrateurs, workspace actif uniquement.
- Parcours rétrospectif de l'assistant (#86) : source éligible (étude close, données verrouillées), identité `{SOURCE}-RETRO` unique, cohorte estimée côté serveur avec seuil de k-anonymat, héritage choisi, paramètres via le dossier réglementaire, données identifiées sans avis éthique refusées ; lancement transactionnel, traçabilité dans les deux journaux, source jamais modifiée.
- Checklist de configuration et mise en production (#115) : l'étude créée s'ouvre sur 4 étapes (exigences réglementaires, paramètres différés à confirmer, recette UAT, signatures data manager puis promoteur) ; patients de test marqués dans la même étude, exclus des exports et statistiques, purgés à la mise en production (journal : effectifs, utilisateur, date), contrôle refait côté serveur
- Design multi-cohortes non randomisé (#149) : cohortes nommées (2 au moins) avec effectif facultatif, accepté en RIPH 3 et RNIPH (aucune randomisation), saisi à l'étape Design (Avancé) et par un préréglage Essentiel, ouvert uniquement ; avertissement si la somme des effectifs des cohortes diffère de l'effectif cible, cohortes affichées à la revue.
- Administration des packs réglementaires (#114) : rôle plateforme `ROLE_REGULATORY_AFFAIRS` sans accès aux données de workspace, modification d'une exigence publiée qui crée une version brouillon (modifications avant → après), publication signée et bloquée si un cas de test échoue, onglets exigences / validation / impact / historique, journal `platform_activity_log` ; les études gardent leur version.
- Équipe de l'assistant d'étude (#121) : PI coordinateur et sponsor lead obligatoires, invitations créées et envoyées seulement au lancement, utilisateurs existants ajoutés directement ; certificats GCP en stockage privé (valide / expiré / manquant, avertissement seul, sans blocage d'accès) et rappel avant expiration (`app:gcp:send-expiry-reminders`).
- Dossier réglementaire de l'étude (#113) : réponses au cadre, catégorie par juridiction et correction auditée, versions de packs conservées à la republication, valeurs d'exigences, documents versionnés servis après contrôle d'accès à l'étude, gouvernance des données, reprise des champs de `RetrospectiveSettings` ; rétention comptée depuis la clôture
- Moteur de règles réglementaires côté serveur (#112), sans persistance ni interface : catégorie par juridiction (RIPH, RNIPH, CTR, MDR, IVDR), exigences avec statut, anomalies à clé stable, versions de packs, correction motivée, règles rétrospectives, rejeu des cas de test ; hébergement et conservation portés par les packs, option `--refresh-drafts` de `app:regulatory-packs:seed`.
- Packs réglementaires versionnés au niveau plateforme (#110) : tables `regulatory_pack`, `regulatory_requirement` et `regulatory_test_case` (non scopées par workspace, lecture seule), packs Core, UE et France en brouillon « validation juridique requise », commande idempotente `app:regulatory-packs:seed`, service de lecture et API `GET /regulatory/packs`.
- Nouvel assistant de création d'étude (#85) : type choisi en premier et définitif, étapes verrouillées jusque-là, parcours prospectif complet validé côté serveur à chaque étape et au lancement, brouillon enregistré automatiquement et repris depuis la liste, parcours rétrospectif annoncé. Critères d'éligibilité lus et modifiés en listes ; un brouillon reste privé à son propriétaire.
- Signatures électroniques au niveau étude (#111) : approbation de la configuration (data manager), mise en production (promoteur) et publication de pack, avec mot de passe, nom imprimé, signification, IP / user agent, empreinte du contenu signé et contrôle d'intégrité ; un mot de passe erroné est refusé et journalisé. Ré-authentification et hachage partagés avec la signature eCRF.
- Cycle de vie d'étude (#109) : statut « Configuration » entre brouillon et en cours (réglages et import ouverts, inclusions réelles bloquées), changements de statut uniquement par des actions dédiées et journalisés (plus de champ statut libre dans le formulaire d'édition), et garde d'inclusion unique : refus si l'étude n'est pas active, est gelée, ou si le site n'ouvre pas les inclusions.
- Assistant de création d'étude, modes et complétude (#116) : mode Essentiel (défaut, mémorisé par utilisateur) ou Avancé, modifiable sans perte de valeur ; complétude calculée côté serveur (bloquant, avant production, avertissement) avec pastilles et panneau latéral ; étude toujours créée en Configuration (mise en production explicite ensuite).
- Assistant de création d'étude, étapes Cadre réglementaire et Réglementaire (#117) : catégorie déduite par le moteur (France, UE, centres) avec correction motivée, matrice par pays, exigences par pack avec contrôles et gouvernance des données, enregistrées dans le dossier réglementaire ; anomalies remontées à la complétude ; carte du cadre rétrospectif prête
- Design de l’étude et réglages de randomisation (#118) : bras nommés, ratio, blocs ou simple, stratification, rôles de levée d’aveugle, saisis à l’étape Design (Avancé) et par les préréglages (Essentiel) ; règles de cohérence côté serveur, erreur de randomisation en RIPH 3 / RNIPH issue du moteur de règles ; valeurs texte existantes migrées si elles se lisent.
- Assistant de création d'étude, eCRF et calendrier des visites (#120) : modèle publié cloné (jamais modifié) qui propose visites et matrice, remplacement refusé côté serveur sans confirmation si le travail a été modifié, étape Calendrier (Avancé), calendrier généré en Essentiel ; doublons de code et visite sans formulaire bloquants, jours, fenêtres, durée et formulaires non planifiés en avertissements.
- Assistant de création d'étude, étape Sites (#119) : investigateur principal, objectif d'inclusion et activation prévue par site, sites choisis dans le référentiel ou créés sur place ; site sans investigateur bloquant, écart de somme ou date manquante : avertissement, effectif cible = somme des objectifs en Essentiel.

### Changed

- **CI suspendue hors release** : plus aucun job ne tourne sur les PR vers `develop` ni sur un push `develop` (budget Actions épuisé) ; la CI complète ne tourne que sur la PR de release vers `main`, le push sur `main` et `workflow_dispatch`. `docs.yaml` et `dependency-audit.yaml` passent en lancement manuel. Les agents vérifient tout en local (skills et `AGENTS.md` adaptés).

- CI (#201) : plusieurs pull requests approuvées se mergent d'affilée sans relancer leur CI (mode lot du skill `merge-pr`, `merge-batch.sh`), la CI complète tourne une fois sur `develop` après le dernier merge, et un nouveau push sur `develop` annule l'exécution en cours (jamais sur `main`).
- La fenêtre de l'assistant de création d'étude est un tiers plus grande (1307 × 907 px au lieu de 980 × 680), dans la limite de l'écran.
- CI (#161) : moins de minutes GitHub Actions par pull request (Tests et E2E sautés sur un brouillon, push qui annule l'exécution en cours, Lint sur les fichiers modifiés, cache Docker lu depuis `develop`, `timeout-minutes` partout) ; les agents ouvrent la pull request en brouillon et `merge-pr` refuse un brouillon.
- Bootstrap (5.3.8), Bootstrap Icons (1.11.3), Inter et Fraunces sont servis par l'application (AssetMapper, polices woff2 auto-hébergées, `font-display: swap`) au lieu de jsDelivr et Google Fonts (#157) : plus aucune requête vers un hôte tiers à l'affichage (RGPD/HDS, réseaux filtrés), ces hôtes sortent de la CSP, le rechargement à chaud passe par l'importmap et la suite E2E bloque tout hôte externe.
- **Mise en page commune des pages publiques d'authentification** (#220) : la connexion utilise `security/_auth_layout.html.twig` et une seule feuille de style ; thème par défaut = préférence du système (plus l'heure) ; langue FR/EN mémorisée dans le cookie `synapse_lang`, lu par `LocaleSubscriber` pour le rendu serveur ; la page défile au lieu d'être tronquée.

### Fixed

- **Finitions de la recette 3.2.0** (#240) : « Tout supprimer » (étape Type) ne confirme plus qu'une fois (modale de l'application) ; messages flash affichés sur les pages publiques (connexion comprise) ; connexion à 390 px sans chevauchement ; en-tête « Actions » des utilisateurs, cases « Langues parlées », libellés de la source rétrospective et séries de l'invitation (sans brouillons) corrigés.
- **Invitation** (#238, #240) : rejoindre un espace avec un compte existant ne déconnecte plus l'utilisateur (le changement de rôles invalidait sa session) et affiche le message de succès ; la fonction attribuée figure dans l'e-mail d'invitation et sur les pages d'acceptation.
- Les actions de compte (modification, réinitialisation 2FA, déblocage, révocation des sessions, e-mail de mot de passe) ne sont plus proposées dans la liste des utilisateurs, la fiche, les tiroirs et la page Équipe qu'à l'Owner du workspace, comme l'impose `USER_ADMINISTER` (#234, #219).
- **Invitation d'une adresse qui a déjà un compte** (#223) : le lien ne savait que créer un compte (erreur 500, e-mail déjà utilisé). La personne se connecte (2FA comprise) puis confirme : elle rejoint l'espace avec le rôle, l'équipe, les études et les sites de l'invitation, sans second compte ni changement de mot de passe. Autre adresse connectée : refus ; déjà membre : pas de doublon.
- **Pages d'invitation et de réinitialisation du mot de passe** (#221) : mise en page d'authentification commune (défilement sur petit écran, zoom ou erreurs, thème et langue FR/EN conservés depuis la connexion), message distinct pour une invitation invalide, expirée, déjà utilisée ou annulée, textes traduits ; une invitation déjà ouverte reste utilisable.
- Assistant d'étude, design (#188) : la phase propose « Sans objet » ou les étapes d'une investigation de dispositif (pilote, pivot, suivi post-commercialisation) selon le produit du cadre réglementaire ; la randomisation n'est plus affichée pour un bras unique ; l'exemple de nom de bras est neutre (« Bras A »).
- **Assistant d’étude** (#186, #197) : étape Type : brouillons avec « Reprendre » et date de dernière modification, confirmation de « Tout supprimer », contenu centré ; Study ID mis en majuscules à la saisie, exemples préfixés « ex. », colonne des étapes sans barre de défilement ; l’étude rétrospective est désactivée (et refusée côté serveur) sans étude source éligible, avec le nombre de sources disponibles.
- **Assistant d’étude** (#190) : les étapes eCRF et Calendrier renvoient à l’étape Import pour créer les champs depuis les colonnes du fichier, sans modèle ni formulaire en double.
- **Import** (#192, #193, #194, #185) : colonnes identifiantes nommées et plage lue à l’étape Fichier, libellés et sections lisibles, retour après création des champs, tableau de rapprochement sans coupure, site d’inclusion unique affiché, une seule phrase de certification, message en cas de signature refusée, reprise à la sous-étape atteinte.
- **Assistant d’étude** (#195, #191) : le récapitulatif ajoute cadre réglementaire, équipe, sites, politique d’import et contenu de l’eCRF, sans Study ID en double et avec le pluriel correct ; l’étape Équipe montre le rôle de chaque membre, le créateur et un résumé des personnes sans certificat GCP (avertissement seul).
- **Assistant d'étude** (#184, #185, #187) : l'enregistrement automatique redessine la complétude et les pastilles et rafraîchit l'heure d'enregistrement (Continuer compris) ; un brouillon rouvert reprend à la dernière étape atteinte, une étape jamais ouverte n'est plus cochée ; la catégorie réglementaire provisoire s'affiche avant le choix des pays.
- **Image de production** (#214) : PHP utilise désormais le bundle de certificats CA copié dans l’image (`openssl.cafile` et `curl.cainfo`), ce qui rétablit les connexions TLS sortantes (flux `ssl://`, cURL, HttpClient) qui échouaient faute de `/usr/lib/ssl/cert.pem`.
- **Assistant d'étude** (#179, #189, #180) : une visite sans formulaire n'est plus bloquante (point avant production), un code de visite déjà pris est refusé dans l'éditeur, « Ajouter une visite » garde la saisie ; sans site, plus d'avertissement sur la somme des objectifs ; l'erreur d'âge min/max est vérifiée en direct et disparaît à la correction.
- **Session** (#181) : l'activité dans l'assistant d'étude (iframe) est relayée au garde d'inactivité par le `BroadcastChannel` et ne laisse plus la session expirer pendant la saisie ; l'avertissement d'expiration est un `<dialog>` natif, visible et utilisable au-dessus de l'assistant ouvert.
- **Import, champs créés depuis les colonnes** (#198, #178) : des codes entiers sans légende donnent un nombre (plus une liste des seules valeurs observées), une colonne 0/1 un Oui / Non, `nb_*` / `nombre_*` / `n_*` un nombre ; la légende de la note reste prioritaire. L'intervalle observé n'est plus une borne de validation (simple indication) et la règle « Hors plage » tolère l'arrondi.
- **CI** (#204) : le job Tests (ou E2E) échouait parfois sur « php is unhealthy » quand le `composer install` du premier démarrage du conteneur `php` ne joignait pas GitHub. L’entrypoint réessaie le téléchargement (3 essais), l’attente est bornée à 120 s, et en cas d’échec la CI affiche `docker compose ps` et les logs de `php` et `database`, puis redémarre les services une fois.
- **Assistant d'étude** (#176) : l'investigateur principal coordinateur et celui de chaque site deviennent membres de l'étude au lancement (gestionnaire sur toute l'étude pour le coordinateur, gestionnaire restreint à son site pour un PI de site), sans doublon ; l'étape Équipe les affiche « inclus d'office », le récapitulatif les compte et l'alerte « data manager » tient compte du propriétaire.
- Dans l'assistant de création d'étude, « Créer les champs sélectionnés et les mapper » (import, étape Colonnes) crée enfin les champs eCRF (#175) : le panneau était un `<form>` imbriqué dans le formulaire de l'assistant, supprimé par le navigateur, et le clic ne faisait rien. C'est désormais un `<div>`, et l'absence du panneau affiche un message d'erreur.
- **Réglementaire** (#177) : le premier dépôt d’un document d’un pack national (ex. `fr.consent`) n’est plus refusé (« Ce document n’est pas attendu ») quand le pays est choisi à l’étape Sites après le cadre réglementaire ; les packs sont resynchronisés à l’étape Sites et avant le dépôt, et les refus indiquent la cause (exigence inconnue ou sans document).
- Une installation de production neuve peut créer son premier administrateur (#167) : `app:admin:create` crée le super-administrateur (mot de passe via `ADMIN_PASSWORD` ou saisie masquée, jamais en option ; changement de mot de passe et 2FA au premier login ; journalisé) et le premier workspace, sans donnée fictive. `app:seed` reste refusé en `prod`, sauf `APP_ALLOW_FAKE_DATA=1` (hors production).
- L'ajout d'un patient à une étude qui a des visites ne renvoie plus une erreur 500 (#115) : l'inclusion est enregistrée avant la planification de ses visites. Le bug touchait la 3.1.0 et les versions précédentes.

## [3.1.0] - 2026-10-18

Version intermédiaire vers l'assistant de création d'étude : elle livre le socle (modèle de données, service d'import, worker) et la clôture d'une étude, **sans nouvel écran de création ni d'import**.

### ⚠️ À vérifier avant déploiement

- **Aucun écran d'import de données** : l'ancien import (`/studies/{id}/import`) est retiré (#82) et le nouveau n'a pas encore d'interface (service, worker et points d'accès JSON seulement) ; les entrées « Importer » des menus d'étude disparaissent. Il n'y a rien à tester ni à annoncer côté utilisateurs.
- **Démarrer le nouveau service `worker`** (#88) : il lit et valide en arrière-plan les imports volumineux. Il est défini dans `compose.yaml` et `compose.prod.yaml` (même image et mêmes variables que `php`) et démarre avec
  `docker compose -f compose.yaml -f compose.prod.yaml up -d`. **À chaque déploiement, il doit repartir sur le nouveau code** : `up -d` le recrée avec l'image reconstruite, sinon forcer avec `up -d --force-recreate worker`. Vérifier qu'il est `healthy`
  (`ps`) et que `logs worker` ne montre pas d'erreur répétée. Les messages en échec (3 reprises) vont dans la file `failed`, qui n'est pas consommée automatiquement : `docker compose ... exec php php bin/console messenger:failed:show`, puis `messenger:failed:retry <id>`
  ou `messenger:failed:remove <id>`. Détails : `docs/deployment/production.md`.
- **Volume nommé `private_uploads`** (#108) : `compose.prod.yaml` monte désormais `/app/private_uploads` (`php` et `worker`) sur un volume qui survit à la recréation du conteneur. **Si des fichiers ont déjà été déposés en production** (avatars, pièces jointes, documents cliniques eCRF), ils sont
  dans la couche inscriptible du conteneur `php` et disparaissent à sa recréation : les copier d'abord avec `docker compose -f compose.yaml -f compose.prod.yaml cp php:/app/private_uploads ./private_uploads-backup`, déployer, les recopier dans le volume avec
  `docker compose ... cp ./private_uploads-backup/. php:/app/private_uploads/`, puis vérifier le propriétaire (`www-data`) et qu'un avatar est toujours servi après `up -d --force-recreate php worker`. Sans fichier déposé, rien à faire. Ce volume n'est pas dans la sauvegarde PostgreSQL :
  voir `docs/deployment/backup.md`. Procédure complète : `docs/deployment/production.md`.
- **Deux nouvelles migrations**, appliquées au démarrage de `php` par l'entrypoint (`--all-or-nothing`), sans reprise de données à lancer à la main : **sauvegarder la base** au préalable.
  - `Version20261017160000` (#83) : colonnes de type, d'étude source, de conception et de listes de critères sur `study`, tables `retrospective_settings` et `data_import`.
    Les études existantes deviennent « prospectives » ;
    le texte des critères d'inclusion et d'exclusion est copié, une ligne par critère, dans les nouvelles listes (les anciennes colonnes sont conservées).
  - `Version20261018091435` (#88) : table `messenger_messages` (files `async` et `failed`) et état de traitement de `data_import`.
- **Variables d'environnement** : `MESSENGER_TRANSPORT_DSN` (#88) est définie dans `.env` (transport Doctrine sur la base existante) et intégrée à l'image par `composer dump-env prod` : rien à ajouter, sauf pour la surcharger. `IMPORT_ASYNC_THRESHOLD` (facultative, 2000 par défaut) fixe le nombre de lignes à partir duquel un import passe par le worker.
  Les secrets obligatoires en production (`APP_SECRET`, `APP_TOTP_ENCRYPTION_KEY`, `APP_PATIENT_ENCRYPTION_KEY`, `APP_PATIENT_SEARCH_HMAC_KEY`) sont maintenant aussi contrôlés au démarrage du conteneur (#50) : un secret vide l'arrête avec un message qui nomme la variable.

### Added

- Clôture d'une étude prospective (#84) : bouton « Clôturer l'étude » de la page d'étude, réservé aux administrateurs et proposé uniquement quand les données sont verrouillées (étude gelée), avec confirmation, CSRF et entrée `study.closed` au journal ;
  c'est une action encadrée, à la différence du champ « statut » de la page de modification d'une étude, qui reste en place et change encore le statut (Terminée comprise) sans ces contrôles jusqu'à sa suppression (#109). Service `RetroSourceEligibility` listant les études pouvant servir de source rétrospective, avec le motif en français sinon (sans écran pour l'instant).
- Modèle de données de la future création d'étude v2 (#83), sans écran : type d'étude immuable (les études existantes deviennent prospectives), étude source du même espace de travail, champs de conception, critères d'éligibilité en listes ordonnées (texte migré ligne par ligne, anciennes colonnes conservées), paramètres rétrospectifs et sessions d'import reprenables.
- Service d'import de données côté serveur (#87), sans écran : lecture xlsx, xls et csv au format large (une ligne par patient, colonnes de visite suffixées `_n` / `.n`), lignes d'annotation ignorées, mapping automatique FR / EN / CDISC vers les champs eCRF de l'étude, conversion d'unités par champ, règles de
  validation groupées par champ, décisions (remplacer, accepter, exclure, corriger), colonnes identifiantes exclues par défaut, propositions de champs pour les colonnes non mappées et reprise sans écrasement.
- Traitement asynchrone des imports (#88) : un worker Messenger (transport Doctrine sur la base existante, service Compose `worker`) lit et valide en arrière-plan les fichiers d'au moins 2 000 lignes, avec 3 reprises puis file `failed`, progression, état et motif d'échec générique sur l'import, et route JSON de suivi ; les petits fichiers restent synchrones.
- Définition de champs eCRF depuis les colonnes d'un import (#92), sans écran : proposition par colonne non mappée (type, unité, plage, options de la note complétées par les valeurs des données, une section par couleur d'en-tête), création dans un formulaire brouillon ou par amendement d'un formulaire actif (nouvelle version, motif au journal),
  puis mappage de la colonne ; deux points d'accès JSON avec CSRF.
- Tests de bout en bout dans un navigateur (#80) : suite `@playwright/test` (`tests/e2e/`, `make e2e`) sur la première connexion, la connexion par code de secours, les pages principales (aucune erreur console ni violation de la CSP), les membres d'étude et la création d'eCRF ; elle tourne en CI (job `E2E`).

### Changed

- Dépendances (#96) : actions GitHub de la CI, correctifs Composer (dont PHPUnit 13.4.3) et compétences de référence mises à jour ; `symfony/messenger` et `symfony/doctrine-messenger` 8.1 ajoutés pour le worker.
- Développement : `docker compose up` démarre aussi le service `worker` (même image et même montage que `php`) ; après la mise à jour d'un clone existant, lancer `make composer c=install` (l'entrypoint n'installe les dépendances que si `vendor/` est vide) ; `make e2e` demande une confirmation avant de réinitialiser la base de la pile en cours.

### Removed

- L'ancien import de données (`/studies/{id}/import`) et ses entrées de menu « Importer / Exporter » et « Importer » sont retirés (#82) : défectueux (patients créés sans workspace, recherches sur des colonnes chiffrées, pas de CSRF, fichier temporaire en clair). **Le nouvel import n'a pas encore d'interface** : aucun écran d'import n'est disponible dans cette version.

### Fixed

- Ajouter un utilisateur déjà membre d'une étude ne renvoie plus une erreur 500 (#104) : le formulaire affiche « Cet utilisateur est déjà membre de l'étude » (422) sans rien écrire, et la liste des utilisateurs exclut les membres actuels
- Les fichiers déposés ne sont plus perdus à chaque recréation du conteneur en production (#108) : volume nommé `private_uploads` pour `php` et `worker`, appartenant à `www-data` ; le dossier est ajouté à `.gitignore`.
- Le gel et le dégel d'une étude ne renvoient plus une erreur 500 : l'entrée du journal d'activité est rattachée à l'étude (#84).
- Un clone neuf ne renvoie plus une erreur 500 sur `/login` (#50) : en développement, l'entrypoint génère dans `.env.dev.local` (ignoré par Git) les secrets encore vides (`APP_SECRET` et les trois clés de chiffrement), sans jamais modifier une valeur déjà définie ; en production, un secret manquant arrête le conteneur avec un message qui nomme la variable.
- La sauvegarde automatique eCRF applique les mêmes règles que la saisie complète (#82) : elle est refusée (403 avec la raison) sur une étude gelée, un patient sous restriction de traitement, un formulaire fermé ou une saisie verrouillée. Une étude dupliquée reste dans le workspace de l'étude source.

## [3.0.1] - 2026-10-15

Version corrective : aucune fonctionnalité nouvelle, pas de changement incompatible.

### ⚠️ À vérifier avant déploiement

- **Sauvegarder la base**, puis chercher les doublons de saisies eCRF : la migration `Version20261015110000`
  (#62) **s'arrête avant toute modification** et liste les doublons si `ecrf_record` contient plusieurs
  saisies pour un même patient d'étude, formulaire et visite. Rien n'est supprimé ni fusionné automatiquement.
  La requête de détection et la marche à suivre (garder la saisie qui porte les données, déplacer ou supprimer
  les doublons vides en gardant la piste d'audit, relancer la migration) sont décrites dans l'en-tête de
  `migrations/Version20261015110000.php`. Sur un déploiement, l'entrypoint applique les migrations avec
  `--all-or-nothing` : un échec laisse la base inchangée.
- **`make db-setup` n'existe plus** : utiliser `make up` puis `make migrate`.

### Changed

- **CI : Composer authentifié dans la CI (#67)** : `COMPOSER_AUTH` (jeton du workflow) sur les étapes d'installation des jobs `Security` et `Quality` et de `dependency-audit.yaml`, pour éviter les erreurs HTTP 429 de `codeload.github.com`.

### Removed

- **`make db-setup`, `bin/setup-db.sh` et `docker/db/provision.sql` (#52)** : obsolètes. Le conteneur PostgreSQL crée déjà le rôle et la base (`POSTGRES_USER`, `POSTGRES_DB`) et l'entrypoint de `php` applique les migrations. `provision.sql` échouait (`CREATE DATABASE` dans un bloc `DO`) et `setup-db.sh` se bloquait. Utiliser `make up` puis `make migrate`.

### Fixed

- **CSP : scripts et gestionnaires en ligne (#48)** : les scripts en ligne des pages `/settings/security`
  (onglet actif conservé dans l'URL) et de l'aperçu du builder eCRF portent maintenant le nonce CSP ; les
  gestionnaires `onclick` / `onchange` / `oninput` bloqués par la politique sont remplacés par des attributs
  `data-*` traités dans `assets/js/inline-handlers.js` (liste des patients, saisie eCRF, aperçu des champs).
- **eCRF : menu déroulant coupé dans l'aperçu du builder (#49)** : la carte de section n'écrête plus la liste d'un champ à choix multiples, qui défile dans la vue à l'ouverture ; les cartes d'aperçu et Choices.js utilisent les couleurs du thème (lisibles en mode sombre).
- **2FA : codes de secours (#59)** : les 10 codes de secours sont générés à la fin de la configuration
  `/2fa/setup` et affichés **une seule fois** (copie, téléchargement, impression ; réponse `no-store`, jamais
  stockés en clair), puis gérés depuis une carte « Sécurité » du profil (nombre restant, régénération). Page
  de connexion : la soumission du code 2FA ne retombe plus sur un envoi natif du formulaire, et un code de
  secours refusé affiche « invalide ou déjà utilisé ».
- **eCRF : page de création d'un formulaire d'étude (#75)** : `/studies/{id}/ecrf/new` renvoyait une erreur 500
  (la spécialité d'un modèle est une entité, affichée comme une chaîne). Le filtre par spécialité utilise
  désormais l'identifiant et le nom de la spécialité, sans doublons.
- **Membres d'étude : pages d'ajout et de modification en erreur 500 (#74)** : le template `study/member_form.html.twig` affichait `form.role` alors que `StudyMemberType` expose `studyRole` depuis le modèle de rôles d'étude.
  Le formulaire affiche maintenant le bon champ, ne propose à l'ajout que les utilisateurs du workspace de l'étude,
  et ne permet plus de changer l'utilisateur d'un membre existant (seul le rôle se modifie).
  Test `StudyMemberTypeTest`.
- **eCRF : index uniques partiels de `ecrf_record` (#62)** : `UNIQ_ECRF_RECORD_FREE` et
  `UNIQ_ECRF_RECORD_VISIT`, qui n'existaient que dans `migrations/_archive/`, sont recréés et déclarés
  dans le mapping. La migration **refuse de s'exécuter** et liste les doublons si la base en contient
  (aucune donnée clinique n'est supprimée ni fusionnée automatiquement : voir l'en-tête de la
  migration pour les résoudre). La création d'une saisie concurrente renvoie un message clair au lieu
  d'une erreur 500.
- **Invitation : valeur par défaut de `assigned_role` (#63)** : le défaut en base passe de `ROLE_USER` à
  `member`, comme l'entité et l'énumération `WorkspaceRole` ; les valeurs hors énumération sont
  normalisées en `member` (déjà le rôle appliqué à l'acceptation).

## [3.0.0] - 2026-10-15

### ⚠️ Changements incompatibles

Actions à prévoir avant de déployer cette version (sauvegarder la base au préalable) :

- **PostgreSQL 16 passe en 18** : l'image 18 attend un montage unique sur `/var/lib/postgresql`. Un
  **nouveau volume** `database_data_pg18` remplace `database_data` ; les données ne sont **pas**
  migrées automatiquement (l'ancien volume reste intact comme sauvegarde de rollback). Suivre le
  guide `docs/deployment/postgresql-18-upgrade.md` (dump, restauration, vérification, rollback)
  avant de relancer la pile. Sur une base de données fictives, un volume neuf suivi de
  `app:seed --reset` suffit.
- **`POSTGRES_VERSION` est supprimée** : la version de l'image est un tag littéral dans
  `compose.yaml` et `serverVersion=18` est fixé partout. Retirer la variable de `.env.local`.
- **`app:seed` : les options `--admin-email` et `--admin-password` sont supprimées**. Utiliser
  l'option répétable `--admin=<email>` et fournir le mot de passe par `SEED_ADMIN_PASSWORD`
  (sinon invite masquée ou mot de passe aléatoire affiché une seule fois). Il n'y a plus
  d'administrateur par défaut : `--reset` demande au moins un super-administrateur (invites
  interactives) et, sans terminal, refuse de s'exécuter sans `--admin` avant de vider la base ;
  chaque administrateur doit changer son mot de passe à la première connexion. La commande refuse
  de s'exécuter en environnement `prod`.
- **Le service `backup` est derrière le profil Compose `backup`** : il ne démarre plus par défaut.
  L'activer avant de stocker des données réelles : `docker compose -f compose.yaml -f compose.prod.yaml
  --profile backup up -d` ou `COMPOSE_PROFILES=backup`. L'image devient
  `nfrastack/db-backup:5.0.5` (variables `DB01_*`).
- **Hub Mercure 1.0** (FrankenPHP embarque désormais Mercure 1.0) : les clés JWT se déclarent dans un
  bloc `issuer` du `Caddyfile`, la directive `demo` et les directives de premier niveau
  `publisher_jwt` / `subscriber_jwt` n'existent plus, et la souscription utilise le paramètre
  `match=` à la place de `topic=`. Toute configuration Caddy personnalisée doit être adaptée.
- **PHP 8.5.11 minimum** (`composer.json`) et **Symfony 8.1** (voir ci-dessous).

### Added

- Guide de démarrage rapide (**Quick Start**) bilingue : opérationnel en 5 à 10 minutes.
- Diagrammes **Mermaid** (architecture, modèle de données ERD, workflow eCRF).
- Pages **Contribuer** et **Bonnes pratiques de sécurité** (FR/EN), fichiers `CONTRIBUTING.md` et
  `SECURITY.md` (signalement privé des vulnérabilités), `README.md` réécrit, copyright du projet dans `LICENSE`.
- Documentation développeur complète en français et en anglais (architecture, backend, modèle de
  données, API, commandes, sécurité, déploiement, QA), page réelle des permissions RBAC.
- Site de documentation dans son propre dépôt (`synapse-docs`, `https://docs.synapse-medical.fr`) :
  sélecteur de **version** dérivé de `APP_VERSION`, page Changelog, liens **GitHub** et **Discord**,
  workflow `docs.yaml` qui synchronise le contenu depuis `develop`.
- Documentation des règles de branches et de déploiement (`AGENTS.md`, `CONTRIBUTING.md`, processus de
  release : `develop` → `release/<date>` → `main` → tag, archivage de la version de la doc).
- Guide de migration `docs/deployment/postgresql-18-upgrade.md` (FR/EN).
- Outillage qualité : **PHPStan** (niveau 6, baseline), **php-cs-fixer** (`@Symfony`) et **Rector**,
  cibles `make cs`, `cs-fix`, `phpstan`, `rector`, `qa` et job CI `Quality`.
- **Audit des dépendances** : workflow hebdomadaire `dependency-audit.yaml` (`composer audit` et
  `importmap:audit` sur `main` et `develop`, issue `security` en cas d'avis) et filtrage des jobs CI par
  chemins modifiés.
- **Dependabot** sur `develop`, mises à jour groupées par écosystème (Composer, GitHub Actions, Docker,
  Docker Compose).
- Simulateur d'autorisations **« what can this user do »** (RBAC) et légende ✓/– sur l'onglet RBAC.
- **Favicon adaptatif** selon `prefers-color-scheme`, basé sur le logo Synapse.
- Seed : distribution de statuts fixe, études d'ophtalmologie, identités cohérentes des utilisateurs
  fictifs, dates d'inclusion étalées.

### Changed

- **PostgreSQL 16 passe en 18** (`postgres:18.6-alpine`, tag littéral mis à jour par Dependabot) et
  `serverVersion=18` aligné partout (#23).
- Mise à jour de **Symfony 8.0** (fin de vie) vers **8.1** (8.1.9) et des recettes Flex associées ;
  correction des dépréciations Twig (macros à la racine, opérateur `??`).
- **PHP 8.5.11 minimum** et images conteneur épinglées sur une version explicite (FrankenPHP
  `1.13.1-php8.5.11`, `debian:13.7-slim` épinglée par digest, Mailpit `v1.31.6`).
- Mise à jour de **choices.js** 10.2.0 vers 11.2.4 (importmap) ; `@hotwired/stimulus` et `sortablejs`
  déjà à jour, aucun avis de sécurité sur les paquets front-end.
- `app:seed` : administrateurs créés sans données personnelles ni mot de passe fixe ;
  `app:create-fake-users` génère son mot de passe commun au lieu d'un mot de passe codé en dur.
- Interface : refonte du tableau de bord, de la page Équipes & Membres, des modèles eCRF (cartes,
  mapping SDTM), de la page Accès (en-tête, boutons d'export), des centres (KPI **taux d'inclusion
  moyen**), des utilisateurs (tiroir de profil élargi, modale d'invitation) et de la barre latérale.
- Refonte des références **Commandes console** et **API** dans le style de la doc Astro.
- CI : jobs Tests, Security et Lint rétablis au vert (migrations et PHPUnit exécutés, linters
  configurés dans `.github/linters/`, PHP 8.5).
- Code reformaté par php-cs-fixer et refactoré par Rector (aucun changement de comportement attendu).

### Removed

- Variable `POSTGRES_VERSION` et options `--admin-email` / `--admin-password` de `app:seed`.
- Entité `Project` et tout le code associé.
- Site Astro du dépôt (`docs-site/`), déplacé dans `synapse-docs`.
- Directive `demo` et directives `publisher_jwt` / `subscriber_jwt` de premier niveau du hub Mercure.

### Fixed

- Connexion : un utilisateur sans 2FA configurée est dirigé vers la page de configuration `/2fa/setup`
  (QR code) au lieu de se voir demander un code inexistant ; seul `/2fa/check` ouvre la face de saisie du code (#56).
- Hub Mercure : configuration compatible Mercure 1.0 (le conteneur `php` redémarrait en boucle).
- Import manquant du type de formulaire dans `EcrfTemplateController::new()` et argument `user` manquant
  lors du déverrouillage d'un compte (`UserController::unlock()`), détectés par PHPStan.
- Template `study/queries.html.twig` : filtre `u` indisponible (`twig/string-extra` absent) remplacé
  par `slice`.
- `seed --reset` autonome de bout en bout et build de production sans mode debug.
- Affichage des KPI des centres sur toute la largeur, masquage du bouton « Réinitialiser » sans filtre actif,
  alignement de l'icône des items parents et de l'avatar dans la barre latérale repliée.
- **Mapping Doctrine et migrations de nouveau synchronisés** (#27) : `doctrine:schema:validate` passe
  sur une base construite depuis les migrations et l'étape `Doctrine Schema Validator` est réactivée dans
  la CI (job Tests). Les index créés à la main sont déclarés dans les entités (noms conservés, index
  partiels via `options: ['where' => ...]`), les valeurs par défaut de colonnes et `activity_log.context`
  (JSONB) sont alignés sur la base. Les index que le mapping ne sait pas décrire (GIN
  `idx_activity_log_context_gin`, index couvrant `idx_study_patient_study_status`) restent gérés par
  les migrations et sont masqués à la comparaison par `IgnoredIndexesPostgreSQLSchemaManager`.
- **Nouvelle migration `Version20261015100000`** : neuf tables passent de séquence classique à colonne
  d'identité (`GENERATED BY DEFAULT AS IDENTITY`, position de la séquence conservée), suppression des
  commentaires de colonne hérités de Doctrine 2 et de trois index redondants. Aucune donnée n'est modifiée ;
  les tables d'audit, leurs déclencheurs d'immutabilité et les politiques RLS ne sont pas touchés.
- **Unicité de `study.study_id` par workspace** (#27) : l'ancien index unique global `uniq_e67f9749e7b003e9`,
  que la migration SEC-7 n'avait pas supprimé, empêchait deux workspaces d'utiliser le même identifiant
  d'étude ; il est supprimé, seul l'index partiel `(study_id, workspace_id)` reste.
- **Journal d'audit** : les 50 appels à `ActivityLogService::log()` des contrôleurs récupèrent désormais l'utilisateur authentifié via un accès typé (`requireUser()`) qui lève un `AccessDeniedException` s'il est absent, au lieu de laisser passer un utilisateur potentiellement `null` : aucune entrée d'audit sans auteur (#53).

### Security

- Correction des avis **symfony/yaml CVE-2026-109413** et **symfony/http-foundation
  CVE-2026-108082**, corrigés à partir de Symfony 8.1.7.
- Mise à jour des dépendances Composer corrigeant 48 avis de sécurité (Symfony, Twig, PhpSpreadsheet,
  otphp…) : `composer audit` ne signale plus aucun avis.
- Durcissement : 2FA inline, politique de tentatives, réinitialisation de mot de passe (lien à usage
  unique, anti-énumération, révocation des sessions), isolation par workspace, jeux de tests de sécurité.
- Images de production épinglées par digest ; plus aucun identifiant ni mot de passe fixe dans le seed.

## [2.0.4] - 2026-06-30

> Version interne, jamais publiée en release (aucun tag `v2.0.4`) : son contenu est inclus dans la
> version 3.0.0, première version publiée.

### Added

- Simulateur d'autorisations **« what can this user do »** (RBAC).
- Documentation technique développeur bilingue (architecture, backend, modèle de données).
- **Favicon adaptatif** selon `prefers-color-scheme`, basé sur le logo Synapse.
- Études d'ophtalmologie et distribution de statuts fixe dans le jeu de données de test.

### Changed

- Page **Accès** : hero aligné sur le design des autres pages, boutons export / rôle custom.
- KPI des centres investigateurs : remplacement du nombre d'investigateurs principaux par le
  **taux d'inclusion moyen**.
- Étalement des dates d'inclusion des patients dans le seed.

### Fixed

- Affichage des KPI des centres sur toute la largeur (grille 4 colonnes).
- Masquage du bouton « Réinitialiser » en l'absence de filtre actif.

[Unreleased]: https://github.com/stevenCayla/SYNAPSE-MEDICAL/compare/v3.1.0...HEAD
[3.1.0]: https://github.com/stevenCayla/SYNAPSE-MEDICAL/compare/v3.0.1...v3.1.0
[3.0.1]: https://github.com/stevenCayla/SYNAPSE-MEDICAL/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/stevenCayla/SYNAPSE-MEDICAL/releases/tag/v3.0.0
