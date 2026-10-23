@echo off
setlocal EnableExtensions
set "SRC=%~dp0"
if "%~1"=="" (
  set "DEST=D:\kord-laptop"
) else (
  set "DEST=%~1"
)
if "%DEST:~-1%"=="\" set "DEST=%DEST:~0,-1%"

if not exist "%DEST%\backend\" (
  echo Install folder not found: %DEST%\backend
  echo Usage: apply-update.bat [D:\kord-laptop]
  exit /b 1
)
if not exist "%SRC%backend\dist\main.js" (
  echo Update folder has no backend\dist. Run package-update.ps1 first.
  exit /b 1
)

echo Stopping services...
if exist "%DEST%\nssm.exe" (
  "%DEST%\nssm.exe" stop kord-web
  "%DEST%\nssm.exe" stop kord-api
) else (
  sc stop kord-web
  sc stop kord-api
)
ping -n 4 127.0.0.1 >nul

echo Copying backend...
robocopy "%SRC%backend\dist" "%DEST%\backend\dist" /MIR /NFL /NDL /NJH /NJS /NP
if errorlevel 8 exit /b 1
robocopy "%SRC%backend\migrations" "%DEST%\backend\migrations" /MIR /NFL /NDL /NJH /NJS /NP
if errorlevel 8 exit /b 1
if not exist "%DEST%\backend\other-files\scripts" mkdir "%DEST%\backend\other-files\scripts"
copy /Y "%SRC%backend\register-paths.js" "%DEST%\backend\register-paths.js" >nul
copy /Y "%SRC%backend\other-files\scripts\run-migrations.js" "%DEST%\backend\other-files\scripts\run-migrations.js" >nul

set "BE_CI=0"
fc /b "%SRC%backend\package-lock.json" "%DEST%\backend\package-lock.json" >nul 2>&1
if errorlevel 1 set "BE_CI=1"
if not exist "%DEST%\backend\node_modules\" set "BE_CI=1"
copy /Y "%SRC%backend\package.json" "%DEST%\backend\package.json" >nul
copy /Y "%SRC%backend\package-lock.json" "%DEST%\backend\package-lock.json" >nul

echo Copying frontend...
robocopy "%SRC%frontend\.next" "%DEST%\frontend\.next" /MIR /NFL /NDL /NJH /NJS /NP
if errorlevel 8 exit /b 1
if exist "%SRC%frontend\public\" (
  robocopy "%SRC%frontend\public" "%DEST%\frontend\public" /E /NFL /NDL /NJH /NJS /NP
  if errorlevel 8 exit /b 1
)

set "FE_CI=0"
fc /b "%SRC%frontend\package-lock.json" "%DEST%\frontend\package-lock.json" >nul 2>&1
if errorlevel 1 set "FE_CI=1"
if not exist "%DEST%\frontend\node_modules\" set "FE_CI=1"
copy /Y "%SRC%frontend\package.json" "%DEST%\frontend\package.json" >nul
copy /Y "%SRC%frontend\package-lock.json" "%DEST%\frontend\package-lock.json" >nul
copy /Y "%SRC%frontend\next.config.js" "%DEST%\frontend\next.config.js" >nul

if "%BE_CI%"=="1" (
  echo npm ci backend...
  pushd "%DEST%\backend"
  call npm ci --omit=dev
  if errorlevel 1 (
    popd
    exit /b 1
  )
  popd
)
if "%FE_CI%"=="1" (
  echo npm ci frontend...
  pushd "%DEST%\frontend"
  call npm ci --omit=dev
  if errorlevel 1 (
    popd
    exit /b 1
  )
  popd
)

echo Migrations...
pushd "%DEST%\backend"
set NODE_ENV=production
node other-files\scripts\run-migrations.js
if errorlevel 1 (
  popd
  exit /b 1
)
popd

echo Starting services...
if exist "%DEST%\nssm.exe" (
  "%DEST%\nssm.exe" start kord-api
  "%DEST%\nssm.exe" start kord-web
) else (
  sc start kord-api
  sc start kord-web
)
echo Updated %DEST%
echo Site: http://127.0.0.1:3008
exit /b 0
