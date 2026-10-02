# SIMU 2026 - prépare le bundle Git à envoyer (Windows PowerShell).
$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot
$num = git config --local simu.candidat 2>$null
if (-not $num) { Write-Host 'ERREUR : dépôt non initialisé.' -ForegroundColor Red; exit 1 }

$pending = git status --porcelain
if ($pending) {
    Write-Host 'ATTENTION : des modifications ne sont pas commitées et ne seront PAS incluses dans le rendu :' -ForegroundColor Yellow
    git status --short
    $r = Read-Host 'Continuer quand même ? (o/N)'
    if ($r -notmatch '^[oO]$') { exit 1 }
}

$f = "candidat-$num.bundle"
if (Test-Path $f) { Remove-Item $f }
git bundle create $f --all
git bundle verify -q $f
if ($LASTEXITCODE -ne 0) { Write-Host 'ERREUR : le bundle est invalide.' -ForegroundColor Red; exit 1 }

Write-Host "`nIdentités présentes dans l'historique (doit être uniquement candidat-$num) :"
git log --all --format='  %an <%ae> / %cn <%ce>' | Sort-Object -Unique

$h = (Get-FileHash $f -Algorithm SHA256).Hash.ToLower()
Write-Host "`nFichier à envoyer : $(Join-Path (Get-Location) $f)"
Write-Host "Empreinte SHA-256 à indiquer dans votre e-mail : $h" -ForegroundColor Green
Write-Host 'Destinataire : s.baudart@swcs.be - heure limite : 17 h 00.'
