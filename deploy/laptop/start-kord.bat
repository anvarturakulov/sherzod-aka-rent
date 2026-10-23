@echo off
setlocal
set "ROOT=%~dp0"
start "kord-api" /D "%ROOT%backend" cmd /k "set NODE_ENV=production&& node -r ./register-paths.js dist/main"
start "kord-web" /D "%ROOT%frontend" cmd /k "node node_modules\next\dist\bin\next start -p 3008"
echo Запущены окна kord-api и kord-web. Сайт: http://127.0.0.1:3008
