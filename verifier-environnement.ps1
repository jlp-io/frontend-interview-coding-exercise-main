# SIMU 2026 - vérifie l'environnement de travail (Windows PowerShell).
Set-Location -Path $PSScriptRoot
$script:ok = 0; $script:ko = 0; $script:av = 0
function Pass($m) { Write-Host "  [OK]        $m" -ForegroundColor Green; $script:ok++ }
function Fail($m) { Write-Host "  [ERREUR]    $m" -ForegroundColor Red; $script:ko++ }
function Warn($m) { Write-Host "  [ATTENTION] $m" -ForegroundColor Yellow; $script:av++ }
function Major($v) { if ($v -match '(\d+)') { [int]$Matches[1] } else { 0 } }
function Has($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }

Write-Host "Vérification de l'environnement SIMU 2026`n"
Write-Host 'Outils'
if (Has git) { Pass ("Git " + ((git --version) -replace '^git version ','')) } else { Fail 'Git introuvable' }
if (Has dotnet) {
    $sdks = @(dotnet --list-sdks 2>$null | ForEach-Object { ($_ -split ' ')[0] })
    $best = $sdks | Sort-Object { [version](($_ -split '-')[0]) } | Select-Object -Last 1
    if ($best -and (Major $best) -ge 8) { Pass "SDK .NET $best" } else { Fail "SDK .NET 8 ou plus récent requis (trouvé : $(if ($best) { $best } else { 'aucun' }))" }
} else { Fail 'SDK .NET introuvable (8 ou plus récent requis)' }
if (Has node) {
    $v = node --version
    if ((Major $v) -ge 20) { Pass "Node.js $v" } else { Warn "Node.js $v : version 20 ou plus récente conseillée" }
} else { Warn 'Node.js introuvable (nécessaire sauf frontend Blazor sans outil E2E JavaScript)' }
if (Has npm) { Pass ("npm " + (npm --version)) } else { Warn 'npm introuvable' }

Write-Host "`nDépôt"
$num = git config --local simu.candidat 2>$null
if ($num) {
    if ((git config --local user.name) -eq "candidat-$num" -and (git config --local user.email) -eq "candidat-$num@simu.invalid") {
        Pass "Identité Git anonyme : candidat-$num"
    } else { Fail 'Identité Git modifiée : relancez init' }
} else { Fail 'Dépôt non initialisé : exécutez .\init.ps1' }
if ((git config --local core.hooksPath 2>$null) -eq '.githooks') { Pass "Hooks d'anonymat actifs" } else { Fail "Hooks d'anonymat inactifs : relancez init" }
foreach ($f in @('docs/reference_K100000_D360_R28000.csv')) {
    if (Test-Path $f) { Pass "$f présent" } else { Fail "$f manquant" }
}

Write-Host "`nRésultat : $script:ok OK, $script:av avertissement(s), $script:ko erreur(s)."
if ($script:ko -gt 0) {
    Write-Host 'Corrigez les erreurs avant de commencer. En cas de problème bloquant, appelez le +32 479 89 01 41.' -ForegroundColor Red
    exit 1
}
