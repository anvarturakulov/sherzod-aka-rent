@echo off
setlocal
set "ROOT=%~dp0"
set "NSSM=%ROOT%nssm.exe"
if not exist "%NSSM%" (
  echo Положите nssm.exe рядом с этим файлом. Сайт: https://nssm.cc/download
  exit /b 1
)
for /f "delims=" %%i in ('where node') do set "NODE=%%i" & goto :found
echo Node.js не найден в PATH.
exit /b 1
:found
if not exist "%ROOT%logs" mkdir "%ROOT%logs"
"%NSSM%" stop kord-api >nul 2>&1
"%NSSM%" stop kord-web >nul 2>&1
"%NSSM%" remove kord-api confirm >nul 2>&1
"%NSSM%" remove kord-web confirm >nul 2>&1

"%NSSM%" install kord-api "%NODE%" -r ./register-paths.js dist/main
"%NSSM%" set kord-api AppDirectory "%ROOT%backend"
"%NSSM%" set kord-api AppEnvironmentExtra NODE_ENV=production
"%NSSM%" set kord-api AppStdout "%ROOT%logs\kord-api.out.log"
"%NSSM%" set kord-api AppStderr "%ROOT%logs\kord-api.err.log"
"%NSSM%" set kord-api AppRotateFiles 1
"%NSSM%" set kord-api AppRotateBytes 1048576
"%NSSM%" set kord-api AppExit Default Restart
"%NSSM%" set kord-api AppRestartDelay 5000
"%NSSM%" set kord-api Start SERVICE_AUTO_START

"%NSSM%" install kord-web "%NODE%" node_modules\next\dist\bin\next start -p 3008
"%NSSM%" set kord-web AppDirectory "%ROOT%frontend"
"%NSSM%" set kord-web AppStdout "%ROOT%logs\kord-web.out.log"
"%NSSM%" set kord-web AppStderr "%ROOT%logs\kord-web.err.log"
"%NSSM%" set kord-web AppRotateFiles 1
"%NSSM%" set kord-web AppRotateBytes 1048576
"%NSSM%" set kord-web AppExit Default Restart
"%NSSM%" set kord-web AppRestartDelay 5000
"%NSSM%" set kord-web Start SERVICE_AUTO_START

"%NSSM%" start kord-api
"%NSSM%" start kord-web
echo Службы kord-api и kord-web установлены. Сайт: http://127.0.0.1:3008
