#!/usr/bin/env bash
# SIMU 2026 — vérifie l'environnement de travail (Linux / macOS / Git Bash).
cd "$(dirname "$0")"
ok=0; ko=0; av=0
pass() { echo "  [OK]    $1"; ok=$((ok+1)); }
fail() { echo "  [ERREUR] $1"; ko=$((ko+1)); }
warn() { echo "  [ATTENTION] $1"; av=$((av+1)); }
major() { printf '%s' "$1" | sed -E 's/^[^0-9]*([0-9]+).*/\1/'; }

echo "Vérification de l'environnement SIMU 2026"
echo
echo "Outils"
if command -v git >/dev/null; then pass "Git $(git --version | awk '{print $3}')"; else fail "Git introuvable"; fi
if command -v dotnet >/dev/null; then
  best=$(dotnet --list-sdks 2>/dev/null | awk '{print $1}' | sort -V | tail -1)
  if [ -n "$best" ] && [ "$(major "$best")" -ge 8 ]; then pass "SDK .NET $best"; else fail "SDK .NET 8 ou plus récent requis (trouvé : ${best:-aucun})"; fi
else fail "SDK .NET introuvable (8 ou plus récent requis)"; fi
if command -v node >/dev/null; then
  v=$(node --version); if [ "$(major "$v")" -ge 20 ]; then pass "Node.js $v"; else warn "Node.js $v : version 20 ou plus récente conseillée"; fi
else warn "Node.js introuvable (nécessaire sauf frontend Blazor sans outil E2E JavaScript)"; fi
if command -v npm >/dev/null; then pass "npm $(npm --version)"; else warn "npm introuvable"; fi

echo
echo "Dépôt"
num=$(git config --local simu.candidat 2>/dev/null || true)
if [ -n "$num" ]; then
  [ "$(git config --local user.name)" = "candidat-$num" ] && [ "$(git config --local user.email)" = "candidat-$num@simu.invalid" ] \
    && pass "Identité Git anonyme : candidat-$num" || fail "Identité Git modifiée : relancez init"
else fail "Dépôt non initialisé : exécutez ./init.sh"; fi
[ "$(git config --local core.hooksPath 2>/dev/null)" = ".githooks" ] && pass "Hooks d'anonymat actifs" || fail "Hooks d'anonymat inactifs : relancez init"
for f in docs/reference_K100000_D360_R28000.csv; do
  [ -f "$f" ] && pass "$f présent" || fail "$f manquant"
done

echo
echo "Résultat : $ok OK, $av avertissement(s), $ko erreur(s)."
if [ "$ko" -gt 0 ]; then
  echo "Corrigez les erreurs avant de commencer. En cas de problème bloquant, appelez le +32 479 89 01 41."
  exit 1
fi
