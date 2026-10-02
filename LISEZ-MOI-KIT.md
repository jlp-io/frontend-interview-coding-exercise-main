# Kit de démarrage — Épreuve SIMU 2026

Ce kit prépare votre dépôt Git pour l'épreuve. Suivez les trois étapes ci-dessous **avant d'écrire la moindre ligne de code**.

## 1. Initialiser le dépôt

Le script génère votre **identifiant anonyme** pour l'épreuve (par exemple `candidat-7K3F9Q`), configure avec lui l'identité Git du dépôt, active les contrôles d'anonymat et crée le premier commit. Vous n'avez rien à saisir.

- Linux, macOS ou Git Bash : `./init.sh`
- Windows PowerShell : `powershell -ExecutionPolicy Bypass -File .\init.ps1`

## 2. Vérifier l'environnement

- Linux, macOS ou Git Bash : `./verifier-environnement.sh`
- Windows PowerShell : `powershell -ExecutionPolicy Bypass -File .\verifier-environnement.ps1`

Corrigez toute ligne marquée [ERREUR] avant de commencer. En cas de problème technique bloquant, appelez le +32 479 89 01 41.

## 3. Préparer le rendu

Quand votre travail est commité :

- Linux, macOS ou Git Bash : `./rendu.sh`
- Windows PowerShell : `powershell -ExecutionPolicy Bypass -File .\rendu.ps1`

Le script crée et vérifie le fichier `candidat-XX.bundle`, affiche les identités présentes dans l'historique et calcule l'empreinte SHA-256. Envoyez le fichier à **s.baudart@swcs.be** avec cette empreinte, au plus tard à **17 h 00**. Vous pouvez envoyer plusieurs versions ; seule la dernière reçue avant l'heure limite est prise en compte.

## Contenu du kit

| Élément | Rôle |
| --- | --- |
| `docs/reference_K100000_D360_R28000.csv` | Jeu de référence (annexe C) |
| `backend/`, `frontend/` | Emplacements suggérés pour votre code |
| `README.md` | À compléter : installation, lancement, tests, emplacement de la spécification OpenAPI |
| `NOTE_CHOIX_TECHNIQUES.md` | À compléter : note de choix techniques |
| `NOTE_USAGE_IA.md` | À compléter : note d'usage de l'IA |
| `.githooks/` | Contrôles d'anonymat exécutés à chaque commit |
| `.gitignore` | Exclut les fichiers générés et les dossiers d'IDE |

## Anonymat

- Ne modifiez pas l'identité Git du dépôt et ne contournez pas les hooks (`--no-verify`).
- Les lignes `Co-authored-by` et `Signed-off-by` ajoutées par certains outils sont retirées automatiquement des messages de commit.
- N'écrivez votre nom, votre adresse e-mail ou votre pseudonyme dans aucun fichier.
