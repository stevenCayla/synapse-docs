---
title: Kit de recette
description: Le fichier de test, les problèmes connus et le modèle de signalement, communs à tous les cahiers de recette.
---

:::caution[Données fictives uniquement]
Le serveur de dev n'est pas un hébergement de santé certifié. N'importez jamais de vrais patients.
:::

## Fichier de test

Copiez le tableau, collez-le en A1 dans Excel, puis colorez les en-têtes : Synapse crée **une section eCRF par couleur**. Les dates doivent être au format date.

<div class="kit-wrap"><table class="kit" id="kitTable"><thead><tr><th class="g0">id</th><th class="g0">nom_usuel</th><th class="g0">nom_naissance</th><th class="g0">prenom</th><th class="g0">date_naissance</th><th class="g0">sexe</th><th class="g1">date_diagnostic</th><th class="g1">diagnostic</th><th class="g1">stade_ajcc</th><th class="g1">breslow_mm</th><th class="g2">chirurgie</th><th class="g2">date_chirurgie</th><th class="g2">traitement_adjuvant</th><th class="g3">date_dernieres_nouvelles</th><th class="g3">recidive</th><th class="g3">deces</th><th class="g3">date_deces</th></tr></thead><tbody><tr><td class="g0">REC-001</td><td class="g0">Martin</td><td class="g0">Martin</td><td class="g0">Lucie</td><td class="g0">14/03/1961</td><td class="g0">1</td><td class="g1">02/02/2023</td><td class="g1">2</td><td class="g1">IIA</td><td class="g1">1,8</td><td class="g2">1</td><td class="g2">20/02/2023</td><td class="g2">0</td><td class="g3">15/09/2026</td><td class="g3">0</td><td class="g3">0</td><td class="g3"></td></tr><tr><td class="g0">REC-002</td><td class="g0">Bernard</td><td class="g0">Petit</td><td class="g0">Claire</td><td class="g0">27/11/1958</td><td class="g0">1</td><td class="g1">15/06/2022</td><td class="g1">1</td><td class="g1">IIIB</td><td class="g1"></td><td class="g2">1</td><td class="g2">30/06/2022</td><td class="g2">1</td><td class="g3">02/10/2026</td><td class="g3">1</td><td class="g3">0</td><td class="g3"></td></tr><tr><td class="g0">REC-003</td><td class="g0">Dubois</td><td class="g0">Dubois</td><td class="g0">Marc</td><td class="g0">05/07/1949</td><td class="g0">0</td><td class="g1">21/01/2021</td><td class="g1">2</td><td class="g1">IV</td><td class="g1">4,2</td><td class="g2">0</td><td class="g2"></td><td class="g2">2</td><td class="g3">10/12/2024</td><td class="g3">1</td><td class="g3">1</td><td class="g3">10/12/2024</td></tr><tr><td class="g0">REC-004</td><td class="g0">Moreau</td><td class="g0">Leroy</td><td class="g0">Anne</td><td class="g0">19/09/1972</td><td class="g0">1</td><td class="g1">08/10/2024</td><td class="g1">2</td><td class="g1">IB</td><td class="g1 flag">NE</td><td class="g2">1</td><td class="g2">25/10/2024</td><td class="g2">0</td><td class="g3">01/10/2026</td><td class="g3">0</td><td class="g3">0</td><td class="g3"></td></tr><tr><td class="g0">REC-005</td><td class="g0">Laurent</td><td class="g0">Laurent</td><td class="g0">Paul</td><td class="g0">30/01/1966</td><td class="g0">0</td><td class="g1">13/04/2023</td><td class="g1">1</td><td class="g1">IIB</td><td class="g1"></td><td class="g2">1</td><td class="g2">28/04/2023</td><td class="g2">1</td><td class="g3">22/08/2026</td><td class="g3">0</td><td class="g3">0</td><td class="g3"></td></tr><tr><td class="g0">REC-006</td><td class="g0">Simon</td><td class="g0">Simon</td><td class="g0">Julie</td><td class="g0">08/12/1980</td><td class="g0">1</td><td class="g1">17/05/2025</td><td class="g1">2</td><td class="g1">IA</td><td class="g1">0,6</td><td class="g2">1</td><td class="g2">03/06/2025</td><td class="g2">0</td><td class="g3">12/10/2026</td><td class="g3">0</td><td class="g3">0</td><td class="g3"></td></tr><tr class="empty"><td colspan="17"></td></tr><tr class="legend"><td>Légende</td><td></td><td></td><td></td><td></td><td>0: homme 1: femme</td><td></td><td>1: carcinome 2: mélanome</td><td>stade AJCC 8e éd.</td><td>en mm, NE = non évaluable</td><td>0: non 1: oui</td><td></td><td>0: aucun 1: radiothérapie 2: chimiothérapie</td><td></td><td>0: non 1: oui</td><td>0: non 1: oui</td><td></td></tr></tbody></table></div>
<div class="kit-act"><button type="button" class="kit-btn" id="kitCopy">Copier pour Excel</button><span id="kitMsg" class="kit-msg" role="status"></span><span class="kit-key"><i class="g1"></i>Diagnostic<i class="g2"></i>Traitement<i class="g3"></i>Suivi</span></div>

### Ce que le fichier teste

- **4 colonnes identifiantes** reconnues par leur nom, masquées dans les aperçus.
- **La ligne vide puis la légende** : ignorées comme patients ; `0: non 1: oui` devient les options des listes.
- **`NE` dans `breslow_mm`** (REC-004) : une valeur non numérique que l'étape Contrôles doit signaler.
- **Des cellules vides** : aucune valeur créée, pas d'erreur.
- **Des jours au-delà de 12** (14/03, 27/11) : vérifient la détection du format JJ/MM/AAAA.

## Problèmes connus

Suivis dans le jalon « Study wizard — UX polish ». Inutile de les signaler à nouveau.

| Où | Ce que vous verrez | Suivi |
|----|--------------------|-------|
| Partout | La complétude ne se met à jour qu'au « Continuer ». | `#184` |
| Reprise d'un brouillon | Des étapes jamais ouvertes sont cochées en vert. | `#185` |
| Cadre réglementaire | La catégorie n'est connue qu'après le choix des pays. | `#187` |
| Design | Phase obligatoire même pour un dispositif ; randomisation visible pour un bras unique. | `#188` |
| Sites | « Σ objectifs sites » en orange sans aucun site. | `#189` |
| Calendrier | Une visite sans formulaire bloque ; ajouter une visite pendant une saisie la vide. | `#179` |
| Import | Libellés bruts, sections « Groupe N », bornes « hors plage » à tort. | `#193` `#178` `#198` |
| Session | Expiration possible après 15 min sans activité hors de la fenêtre. | `#181` |

## Signaler un problème

Pour chaque anomalie, envoyez ces informations avec une capture d'écran :

```text
Cahier et étape : (ex. REC-01 · étape 6 Sites)
Adresse de la page : https://dev.synapse-medical.fr/…
Ce que j'ai fait : (valeurs saisies)
Ce que j'attendais :
Ce qui s'est passé : (message exact, capture)
Navigateur et heure :
```
