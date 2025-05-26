# Couleurs
$Host.UI.RawUI.ForegroundColor = "White"

function Write-Color {
    param (
        [string]$Text,
        [ConsoleColor]$Color = "White"
    )
    $oldColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Text
    $Host.UI.RawUI.ForegroundColor = $oldColor
}

function Get-RelativePath {
    param (
        [string]$From,
        [string]$To
    )
    $fromUri = New-Object System.Uri((Resolve-Path $From).ProviderPath + [System.IO.Path]::DirectorySeparatorChar)
    $toUri = New-Object System.Uri((Resolve-Path $To).ProviderPath)
    $relativeUri = $fromUri.MakeRelativeUri($toUri)
    $relativePath = [System.Uri]::UnescapeDataString($relativeUri.ToString())
    return $relativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar
}

# Configuration
$FRONT_SRC_DIR = ".\app"
$BACK_SRC_DIR = ".\api"
$DEPLOY_DIR = ".\dist\ndi-connect"
$DEPLOY_APP_DIR = $DEPLOY_DIR
$DEPLOY_API_DIR = Join-Path $DEPLOY_DIR "api"

# Confirmation
$confirmation = Read-Host "Voulez-vous vraiment lancer le déploiement ? (O/N)"

if ($confirmation -ne 'O' -and $confirmation -ne 'o') {
    Write-Host "Déploiement annulé."
    exit
}

# Nettoyage
Write-Color "Nettoyage du dossier de déploiement..." Blue
if (Test-Path $DEPLOY_DIR) {
    Remove-Item -Recurse -Force $DEPLOY_DIR
}
New-Item -ItemType Directory -Path $DEPLOY_APP_DIR -Force | Out-Null
New-Item -ItemType Directory -Path $DEPLOY_API_DIR -Force | Out-Null

# Build du front
Write-Color "Build du front React..." Yellow
Push-Location $FRONT_SRC_DIR
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Color "Erreur lors du build React." Red
    exit 1
}
Pop-Location

# Copie du build front
Write-Color "Copie du build React..." Blue
Copy-Item -Path (Join-Path $FRONT_SRC_DIR "build\*") -Destination $DEPLOY_APP_DIR -Recurse -Force

# Copie du backend PHP (avec .env)
#Write-Color "Copie du backend PHP... (avec .env)" Blue
#Copy-Item -Path (Join-Path $BACK_SRC_DIR "*") -Destination $DEPLOY_API_DIR -Recurse -Force

# Copie du backend PHP (sans .env)
Write-Color "Copie du backend PHP (sans .env)..." Blue

Get-ChildItem -Path $BACK_SRC_DIR -Recurse -File | Where-Object { $_.Name -ne '.env' } | ForEach-Object {
    $relativePath = Get-RelativePath $BACK_SRC_DIR $_.FullName
    $destPath = Join-Path $DEPLOY_API_DIR $relativePath
    $destDir = Split-Path $destPath
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    Copy-Item -Path $_.FullName -Destination $destPath -Force
}

# Terminé
Write-Color "Déploiement terminé dans '$DEPLOY_DIR'" Green

# Fin - attente d'appui sur une touche avant fermeture
Write-Host "Appuyez sur une touche pour fermer..."
[void][System.Console]::ReadKey($true)
exit
