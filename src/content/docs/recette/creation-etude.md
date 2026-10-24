---
title: "REC-01 · Création d'étude"
description: "Scénarios de recette de l'assistant « Nouvelle étude » : parcours prospectif, rétrospectif, déduction du cadre réglementaire et passage en production."
---

<p class="rec-meta"><span class="rstat ok">Approuvé</span> Cahier v1.3 · Rédigé par S. Cayla · Revu par QA</p>

:::caution[Document de référence, pas preuve d'exécution]
Cette page décrit les tests et leurs résultats attendus. Les résultats signés (PV, captures, écarts) sont consignés dans le système qualité, référencés par l'ID de campagne.
:::

## Périmètre

<div class="kpis"><div><b>14</b><span>cas de test</span></div><div><b>6</b><span>exigences couvertes</span></div><div><b>3</b><span>critiques GxP</span></div><div><b>~45 min</b><span>durée d'exécution</span></div></div>

| Exigence | Libellé | Cas | Criticité |
|----------|---------|-----|-----------|
| `EX-STU-01` | Créer une étude prospective en mode Essentiel | TC-01, TC-02 | <span class="crit h">Haute</span> |
| `EX-STU-02` | Déduire la catégorie réglementaire (RIPH 1/2/3, RNIPH) | TC-03 → TC-08 | <span class="crit h">Haute</span> |
| `EX-STU-03` | Tracer toute surcharge du cadre dans l'audit trail | TC-09 | <span class="crit h">Haute</span> |
| `EX-STU-04` | Interdire la randomisation en RIPH 3 | TC-10 | <span class="crit m">Moyenne</span> |
| `EX-STU-05` | Passage en production après double e-signature | TC-11, TC-12 | <span class="crit h">Haute</span> |
| `EX-STU-06` | Interface et fiche PDF bilingues FR / EN | TC-13, TC-14 | <span class="crit l">Basse</span> |

## Prérequis

- Environnement de recette `uat.synapse-medical.fr`, release `v3.1.0` déployée.
- Comptes `dm@synapse.local` (Data Manager) et `sponsor@synapse.local` (Promoteur), formation BPC à jour.
- Pack réglementaire `FR-2026.2` publié.

## Cas de test

Pendant une session, cochez chaque étape et notez le statut. La saisie reste locale à votre navigateur et sert à préparer le PV.

<div class="runbar"><span id="runProg" role="status">0 / 3 cas exécutés</span><span class="sp"></span><button type="button" class="kit-btn" id="runReset">Réinitialiser</button><button type="button" class="kit-btn pri" id="runExport">Préparer le PV</button></div>
<div class="tc" data-tc="TC-01"><div class="tc-h"><code>TC-01</code><b>Créer une étude prospective (mode Essentiel)</b><span class="crit h">Haute</span><select class="tc-s" aria-label="Statut de TC-01"><option value="">Non exécuté</option><option value="ok">Conforme</option><option value="ko">Non conforme</option><option value="na">Bloqué</option></select></div><table class="steps-t"><thead><tr><th></th><th>#</th><th>Action</th><th>Résultat attendu</th></tr></thead><tbody><tr><td><input type="checkbox" aria-label="Étape 1 faite"></td><td>1</td><td>Études → <b>Nouvelle étude</b> → Prospective</td><td>L'assistant s'ouvre en mode Essentiel, étape 1/6</td></tr><tr><td><input type="checkbox" aria-label="Étape 2 faite"></td><td>2</td><td>Saisir acronyme <code>REC-PRO-01</code>, titre, promoteur</td><td>Le bouton Suivant s'active ; acronyme unique vérifié</td></tr><tr><td><input type="checkbox" aria-label="Étape 3 faite"></td><td>3</td><td>Répondre au Cadre : intervention non justifiée par la prise en charge, risque minime</td><td>Catégorie proposée : <b>RIPH 2</b>, avec justification</td></tr><tr><td><input type="checkbox" aria-label="Étape 4 faite"></td><td>4</td><td>Valider la Revue → <b>Créer l'étude</b></td><td>Étude au statut <b>Configuration</b>, checklist en 4 étapes affichée</td></tr></tbody></table></div>
<div class="tc" data-tc="TC-09"><div class="tc-h"><code>TC-09</code><b>Surcharger la catégorie réglementaire</b><span class="crit h">Haute</span><select class="tc-s" aria-label="Statut de TC-09"><option value="">Non exécuté</option><option value="ok">Conforme</option><option value="ko">Non conforme</option><option value="na">Bloqué</option></select></div><table class="steps-t"><thead><tr><th></th><th>#</th><th>Action</th><th>Résultat attendu</th></tr></thead><tbody><tr><td><input type="checkbox" aria-label="Étape 1 faite"></td><td>1</td><td>À l'étape Cadre, cliquer <b>Modifier la catégorie</b> → RIPH 3</td><td>Un motif est exigé (min. 20 caractères)</td></tr><tr><td><input type="checkbox" aria-label="Étape 2 faite"></td><td>2</td><td>Saisir un motif et confirmer</td><td>Badge « Surchargé » visible sur la Revue</td></tr><tr><td><input type="checkbox" aria-label="Étape 3 faite"></td><td>3</td><td>Ouvrir Audit trail de l'étude</td><td>Entrée : ancienne / nouvelle valeur, motif, utilisateur, horodatage UTC</td></tr></tbody></table></div>
<div class="tc" data-tc="TC-10"><div class="tc-h"><code>TC-10</code><b>Randomisation interdite en RIPH 3</b><span class="crit m">Moyenne</span><select class="tc-s" aria-label="Statut de TC-10"><option value="">Non exécuté</option><option value="ok">Conforme</option><option value="ko">Non conforme</option><option value="na">Bloqué</option></select></div><table class="steps-t"><thead><tr><th></th><th>#</th><th>Action</th><th>Résultat attendu</th></tr></thead><tbody><tr><td><input type="checkbox" aria-label="Étape 1 faite"></td><td>1</td><td>Étude en RIPH 3, mode Avancé → étape Design</td><td>Option Randomisation désactivée, info-bulle avec la règle</td></tr><tr><td><input type="checkbox" aria-label="Étape 2 faite"></td><td>2</td><td>Repasser en RIPH 2 avec randomisation activée, puis revenir en RIPH 3</td><td>Alerte bloquante : la randomisation doit être retirée</td></tr></tbody></table></div>

TC-02 à TC-08 et TC-11 à TC-14 suivent le même format.

## Critères d'acceptation

- 100 % des cas <span class="crit h">Haute</span> conformes.
- Aucune anomalie bloquante ouverte ; anomalies mineures tracées avec un plan d'action.
- PV signé par le Data Manager et l'Assurance Qualité.
