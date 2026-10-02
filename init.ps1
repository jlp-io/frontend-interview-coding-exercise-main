# SIMU 2026 - initialise le dépôt avec un identifiant anonyme généré (Windows PowerShell).
$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

if (-not (Test-Path .git)) {
    git init -q
    git symbolic-ref HEAD refs/heads/main
}

# Identifiant anonyme : généré une seule fois, conservé si le script est relancé
$num = git config --local simu.candidat 2>$null
if (-not $num) {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.ToCharArray()
    $num = -join (1..6 | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}
$id = "candidat-$num"

git config --local simu.candidat $num
git config --local user.name  $id
git config --local user.email "$id@simu.invalid"
git config --local core.hooksPath .githooks
git config --local commit.gpgsign false   # une signature GPG personnelle révélerait l'identité
git config --local tag.gpgsign false

git rev-parse --verify -q HEAD *> $null
if ($LASTEXITCODE -ne 0) {
    git add -A
    git commit -q -m 'Initialisation du kit SIMU'
}

Write-Host ''
Write-Host "Dépôt initialisé. Votre identifiant anonyme pour l'épreuve : $id" -ForegroundColor Green
Write-Host 'Il sera utilisé automatiquement pour vos commits et votre rendu.'
Write-Host 'Étape suivante : .\verifier-environnement.ps1'
