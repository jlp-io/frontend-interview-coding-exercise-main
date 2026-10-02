#!/usr/bin/env bash
# SIMU 2026 — prépare le bundle Git à envoyer (Linux / macOS / Git Bash).
set -euo pipefail
cd "$(dirname "$0")"
num=$(git config --local simu.candidat || true)
[ -z "$num" ] && { echo "ERREUR : dépôt non initialisé." >&2; exit 1; }

if [ -n "$(git status --porcelain)" ]; then
  echo "ATTENTION : des modifications ne sont pas commitées et ne seront PAS incluses dans le rendu :"
  git status --short
  read -rp "Continuer quand même ? (o/N) " r; [ "$r" = "o" ] || [ "$r" = "O" ] || exit 1
fi

f="candidat-$num.bundle"
rm -f "$f"
git bundle create "$f" --all
git bundle verify -q "$f"

echo
echo "Identités présentes dans l'historique (doit être uniquement candidat-$num) :"
git log --all --format='  %an <%ae> / %cn <%ce>' | sort -u

if command -v sha256sum >/dev/null; then h=$(sha256sum "$f" | awk '{print $1}'); else h=$(shasum -a 256 "$f" | awk '{print $1}'); fi
echo
echo "Fichier à envoyer : $(pwd)/$f"
echo "Empreinte SHA-256 à indiquer dans votre e-mail : $h"
echo "Destinataire : s.baudart@swcs.be — heure limite : 17 h 00."
