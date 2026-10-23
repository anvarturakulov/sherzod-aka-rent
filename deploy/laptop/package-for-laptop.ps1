# Builds release/kord-laptop without TypeScript sources.
# powershell -ExecutionPolicy Bypass -File deploy/laptop/package-for-laptop.ps1
$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$out = Join-Path $root "release\kord-laptop"
$apiDomain = "http://127.0.0.1:7008"

if (Test-Path $out) {
  Remove-Item $out -Recurse -Force
}
New-Item -ItemType Directory -Path $out | Out-Null

Write-Host "Building backend..."
Push-Location (Join-Path $root "backend")
npm run build
if ($LASTEXITCODE -ne 0) { throw "backend build failed" }
Pop-Location

Write-Host "Building frontend..."
Push-Location (Join-Path $root "frontend")
$env:NEXT_PUBLIC_DOMAIN = $apiDomain
$env:LAPTOP_PACKAGE_BUILD = "1"
npx next build --webpack
$code = $LASTEXITCODE
Remove-Item Env:NEXT_PUBLIC_DOMAIN -ErrorAction SilentlyContinue
Remove-Item Env:LAPTOP_PACKAGE_BUILD -ErrorAction SilentlyContinue
if ($code -ne 0) { throw "frontend build failed" }
Pop-Location

$backendOut = Join-Path $out "backend"
$frontendOut = Join-Path $out "frontend"
New-Item -ItemType Directory -Path $backendOut | Out-Null
New-Item -ItemType Directory -Path $frontendOut | Out-Null

Copy-Item (Join-Path $root "backend\dist") (Join-Path $backendOut "dist") -Recurse
Copy-Item (Join-Path $root "backend\register-paths.js") $backendOut
Copy-Item (Join-Path $root "backend\package.json") $backendOut
Copy-Item (Join-Path $root "backend\package-lock.json") $backendOut
Copy-Item (Join-Path $root "backend\migrations") (Join-Path $backendOut "migrations") -Recurse
New-Item -ItemType Directory -Path (Join-Path $backendOut "other-files\scripts") -Force | Out-Null
Copy-Item (Join-Path $root "backend\other-files\scripts\run-migrations.js") (Join-Path $backendOut "other-files\scripts\run-migrations.js")
Copy-Item (Join-Path $PSScriptRoot "production.env.example") (Join-Path $backendOut ".production.env.example")

foreach ($dir in @(
  "uploads\images\products",
  "uploads\docs",
  "uploads\furniture-orders",
  "uploads\tmz-products"
)) {
  New-Item -ItemType Directory -Path (Join-Path $backendOut $dir) -Force | Out-Null
}

Write-Host "Installing backend dependencies..."
Push-Location $backendOut
npm ci --omit=dev
if ($LASTEXITCODE -ne 0) { throw "backend npm ci failed" }
Pop-Location

Copy-Item (Join-Path $root "frontend\.next") (Join-Path $frontendOut ".next") -Recurse
if (Test-Path (Join-Path $root "frontend\public")) {
  Copy-Item (Join-Path $root "frontend\public") (Join-Path $frontendOut "public") -Recurse
}
Copy-Item (Join-Path $root "frontend\package.json") $frontendOut
Copy-Item (Join-Path $root "frontend\package-lock.json") $frontendOut
Copy-Item (Join-Path $root "frontend\next.config.js") $frontendOut

Write-Host "Installing frontend dependencies..."
Push-Location $frontendOut
npm ci --omit=dev
if ($LASTEXITCODE -ne 0) { throw "frontend npm ci failed" }
Pop-Location

Copy-Item (Join-Path $PSScriptRoot "start-kord.bat") $out
Copy-Item (Join-Path $PSScriptRoot "stop-kord.bat") $out
Copy-Item (Join-Path $PSScriptRoot "install-services.bat") $out
Copy-Item (Join-Path $PSScriptRoot "PACKAGE.txt") $out

Write-Host "Done: $out"
