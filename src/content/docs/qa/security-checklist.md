---
title: "Checklist de recette QA — Security"
---

## Vérifications générales
- [ ] Vérifier qu’une section `security` existe bien dans les settings applicatifs.
- [ ] Vérifier que tous les paramètres de sécurité attendus sont présents.
- [ ] Vérifier que des valeurs par défaut sûres sont définies.
- [ ] Vérifier que les valeurs sont validées côté serveur.
- [ ] Vérifier que les incohérences de configuration sont bloquées.
- [ ] Vérifier qu’un service central lit bien les settings de sécurité.
- [ ] Vérifier que les changements de settings sensibles sont tracés si prévu.

## Gestion des sessions
- [ ] Vérifier qu’une session expire réellement après la durée d’inactivité configurée.
- [ ] Vérifier que l’expiration est contrôlée côté serveur, pas uniquement en JavaScript.
- [ ] Vérifier que l’activité utilisateur met bien à jour le timestamp d’activité.
- [ ] Vérifier que les routes exclues du contrôle d’inactivité sont correctement gérées.
- [ ] Vérifier qu’une session expirée redirige bien vers la page de connexion.
- [ ] Vérifier qu’un message explicite informe l’utilisateur que la session a expiré.
- [ ] Vérifier que la session ne peut pas être prolongée après expiration réelle côté serveur.
- [ ] Vérifier que la prolongation de session fonctionne quand la session est encore valide.
- [ ] Vérifier que le comportement est correct avec plusieurs onglets ouverts.
- [ ] Vérifier qu’aucune donnée sensible n’est stockée dans `localStorage` ou `sessionStorage`.

## Modal d’avertissement avant déconnexion
- [ ] Vérifier qu’une modal s’affiche avant l’expiration de session.
- [ ] Vérifier que le décompte affiché correspond à la valeur configurée.
- [ ] Vérifier que le compteur descend correctement jusqu’à 0.
- [ ] Vérifier que le bouton “Prolonger la session” fonctionne.
- [ ] Vérifier que la modal se ferme bien après prolongation réussie.
- [ ] Vérifier qu’en cas d’échec du keepalive, l’utilisateur est redirigé proprement.
- [ ] Vérifier que la modal est accessible clavier.
- [ ] Vérifier que la modal est correcte visuellement sur desktop et mobile.

## Cookies et sécurité de session
- [ ] Vérifier que le cookie de session est en `HttpOnly`.
- [ ] Vérifier que le cookie de session est en `Secure` en HTTPS.
- [ ] Vérifier que `SameSite` est défini avec la valeur attendue.
- [ ] Vérifier que l’identifiant de session est régénéré après authentification.
- [ ] Vérifier qu’il n’y a pas de vulnérabilité évidente de fixation de session.
- [ ] Vérifier qu’une déconnexion invalide bien la session côté serveur.

## Authentification
- [ ] Vérifier que seules les routes publiques nécessaires sont accessibles sans login.
- [ ] Vérifier qu’un utilisateur authentifié accède bien aux routes autorisées.
- [ ] Vérifier qu’un utilisateur non authentifié est redirigé vers le login.
- [ ] Vérifier que le flux de connexion réussi met bien à jour `lastLoginAt` si prévu.
- [ ] Vérifier que les messages d’erreur de connexion ne divulguent pas trop d’informations.

## Changement obligatoire du mot de passe
- [ ] Vérifier qu’un utilisateur avec `mustChangePassword = true` est redirigé après connexion.
- [ ] Vérifier qu’il ne peut pas accéder aux pages métier tant que le mot de passe n’est pas changé.
- [ ] Vérifier que seules les routes autorisées restent accessibles dans cet état.
- [ ] Vérifier que la page de changement obligatoire s’affiche correctement.
- [ ] Vérifier qu’après changement réussi, `mustChangePassword` passe bien à `false`.
- [ ] Vérifier que `passwordChangedAt` est bien renseigné.
- [ ] Vérifier que l’utilisateur récupère l’accès normal après le changement.
- [ ] Vérifier que le mot de passe est bien rehashé avec le mécanisme Symfony attendu.
- [ ] Vérifier qu’aucun mot de passe en clair n’est stocké ou loggé.

## Politique de mot de passe
- [ ] Vérifier que la longueur minimale configurée est bien appliquée.
- [ ] Vérifier que la présence d’une majuscule est contrôlée si activée.
- [ ] Vérifier que la présence d’une minuscule est contrôlée si activée.
- [ ] Vérifier que la présence d’un chiffre est contrôlée si activée.
- [ ] Vérifier que la présence d’un caractère spécial est contrôlée si activée.
- [ ] Vérifier que la confirmation du mot de passe est obligatoire.
- [ ] Vérifier que les erreurs de validation sont claires côté utilisateur.
- [ ] Vérifier que la validation est bien refaite côté serveur, même si le JS est désactivé.
- [ ] Vérifier que le collage dans les champs mot de passe reste possible.
- [ ] Vérifier que les attributs `autocomplete` sont correctement renseignés.

## Historique des mots de passe
- [ ] Vérifier qu’une table ou entité d’historique des mots de passe existe si prévue.
- [ ] Vérifier que seuls des hash sont stockés dans l’historique.
- [ ] Vérifier qu’un ancien mot de passe récent ne peut pas être réutilisé.
- [ ] Vérifier que la profondeur de l’historique correspond au setting configuré.
- [ ] Vérifier que l’historique est purgé correctement au-delà de la limite prévue.

## Protection contre brute force
- [ ] Vérifier que le throttling de login est actif si prévu.
- [ ] Vérifier que plusieurs échecs consécutifs déclenchent la protection.
- [ ] Vérifier que le verrouillage temporaire s’applique après le nombre d’échecs configuré.
- [ ] Vérifier que la durée du verrouillage correspond au setting prévu.
- [ ] Vérifier qu’une connexion réussie remet à zéro l’état d’échec si attendu.
- [ ] Vérifier que les messages retournés ne facilitent pas l’énumération de comptes.
- [ ] Vérifier que la demande de réinitialisation (`POST /password-reset`) refuse un jeton CSRF absent ou invalide, sans e-mail envoyé.
- [ ] Vérifier que la demande de réinitialisation est limitée à 5 par 15 minutes par IP et 3 par 15 minutes par adresse, avec la même réponse générique et sans e-mail au-delà, et que les logs ne contiennent qu'un HMAC (clé dérivée de `APP_SECRET`) de l'IP ou de l'adresse.

## Contrôle d’accès
- [ ] Vérifier que les `access_control` Symfony sont cohérents.
- [ ] Vérifier que les routes sensibles nécessitent bien authentification et rôle adapté.
- [ ] Vérifier que les utilisateurs avec mot de passe à changer sont transversalement bloqués.
- [ ] Vérifier qu’aucune route métier n’échappe par erreur aux contrôles de sécurité.

## Logs et traçabilité
- [ ] Vérifier que les connexions réussies sont loggées si prévu.
- [ ] Vérifier que les échecs de connexion sont loggés.
- [ ] Vérifier que les verrouillages temporaires sont loggés.
- [ ] Vérifier que les déconnexions automatiques pour inactivité sont loggées.
- [ ] Vérifier que les changements de mot de passe sont loggés.
- [ ] Vérifier que les refus d’accès liés à `mustChangePassword` sont loggés si prévu.
- [ ] Vérifier qu’aucun mot de passe, token ou secret n’apparaît dans les logs.
- [ ] Vérifier que les logs ne contiennent pas plus de données personnelles que nécessaire.

## CSRF, Twig, sécurité web
- [ ] Vérifier que les formulaires sensibles sont protégés par CSRF.
- [ ] Vérifier que les actions sensibles non idempotentes sont protégées.
- [ ] Vérifier que les templates Twig utilisent bien l’échappement attendu.
- [ ] Vérifier qu’aucune donnée non échappée n’est injectée dans le HTML ou le JS.
- [ ] Vérifier que les en-têtes de sécurité HTTP attendus sont présents.
- [ ] Vérifier que la CSP n’introduit pas de régression si elle a été mise en place.
- [ ] Vérifier que `X-Frame-Options`, `Referrer-Policy` et `X-Content-Type-Options` sont corrects si prévus.

## Base de données et migrations
- [ ] Vérifier que les migrations Doctrine ont bien été générées.
- [ ] Vérifier qu’elles passent sans erreur en local et sur environnement de test.
- [ ] Vérifier que les nouvelles colonnes utilisateur sont bien créées.
- [ ] Vérifier que les valeurs initiales pour les utilisateurs existants sont cohérentes.
- [ ] Vérifier qu’aucune migration ne casse les données existantes.

## Tests
- [ ] Vérifier qu’il existe des tests unitaires pour les settings de sécurité.
- [ ] Vérifier qu’il existe des tests pour la politique de mot de passe.
- [ ] Vérifier qu’il existe des tests fonctionnels pour l’expiration de session.
- [ ] Vérifier qu’il existe des tests fonctionnels pour le changement obligatoire du mot de passe.
- [ ] Vérifier qu’il existe des tests fonctionnels pour le throttling / lockout.
- [ ] Vérifier que les tests passent tous sans adaptation manuelle cachée.

## Conformité et bonnes pratiques
- [ ] Vérifier que la sécurité repose d’abord sur le serveur.
- [ ] Vérifier que les données sensibles sont minimisées dans l’UI et les logs.
- [ ] Vérifier que la rotation périodique du mot de passe n’est pas appliquée globalement sans justification.
- [ ] Vérifier que les comptes sensibles ou admins ont un traitement renforcé si prévu.
- [ ] Vérifier que la documentation `Security` a bien été mise à jour avec les fonctionnalités réellement implémentées.
