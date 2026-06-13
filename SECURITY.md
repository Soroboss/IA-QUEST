# Sécurité de IA Quest

## Principes

- Les secrets administrateur ne doivent jamais être placés dans le code frontend.
- Les variables locales sont stockées dans `.env` ou `.env.local`, tous deux ignorés par Git.
- La clé `VITE_INSFORGE_ANON_KEY` est une clé publique limitée par l’authentification et les politiques RLS.
- Les données de chaque joueur sont isolées par `auth.uid()` sur toutes les tables publiques.
- La vérification de l’adresse email est obligatoire avant l’accès au compte.

## Protections actives

- Content Security Policy, HSTS, anti-framing et restrictions des permissions du navigateur.
- Validation SQL des profils, progressions et résultats.
- Limitation des envois de résultats à 20 par minute et par joueur.
- Ralentissement local après cinq échecs de connexion en cinq minutes.
- Mots de passe de 10 caractères minimum avec majuscule, minuscule et chiffre dans l’application.
- Audit des dépendances avec `npm audit`.

## Signalement

Ne publiez jamais une vulnérabilité avec des données personnelles dans une issue publique.
Contactez directement l’administrateur du projet Soroboss avec les étapes minimales permettant
de reproduire le problème.
