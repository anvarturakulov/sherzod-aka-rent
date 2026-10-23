@echo off
setlocal
set "ROOT=%~dp0"
if exist "%ROOT%nssm.exe" (
  "%ROOT%nssm.exe" stop kord-web
  "%ROOT%nssm.exe" stop kord-api
)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":7008" ^| findstr "LISTENING"') do taskkill /PID %%p /F >nul 2>&1
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3008" ^| findstr "LISTENING"') do taskkill /PID %%p /F >nul 2>&1
echo Остановлены процессы на портах 7008 и 3008.
