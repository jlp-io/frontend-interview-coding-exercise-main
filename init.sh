#!/usr/bin/env bash
# SIMU 2026 — initialise le dépôt avec un identifiant anonyme généré (Linux / macOS / Git Bash).
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d .git ]; then
  git init -q
  git symbolic-ref HEAD refs/heads/main
fi

# Identifiant anonyme : généré une seule fois, conservé si le script est relancé
NUM=$(git config --local simu.candidat || true)
if [ -z "$NUM" ]; then
  NUM=$(LC_ALL=C tr -dc 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' < /dev/urandom | head -c 6 || true)
fi
ID="candidat-$NUM"

git config --local simu.candidat "$NUM"
git config --local user.name  "$ID"
git config --local user.email "$ID@simu.invalid"
git config --local core.hooksPath .githooks
git config --local commit.gpgsign false   # une signature GPG personnelle révélerait l'identité
git config --local tag.gpgsign false
chmod +x .githooks/* ./*.sh 2>/dev/null || true

if ! git rev-parse --verify -q HEAD >/dev/null; then
  git add -A
  git commit -q -m "Initialisation du kit SIMU"
fi

echo
echo "Dépôt initialisé. Votre identifiant anonyme pour l'épreuve : $ID"
echo "Il sera utilisé automatiquement pour vos commits et votre rendu."
echo "Étape suivante : ./verifier-environnement.sh"
