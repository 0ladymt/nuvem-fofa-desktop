@echo off
chcp 65001 >nul
where npm >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js LTS primeiro: https://nodejs.org
  pause
  exit /b 1
)
if not exist node_modules call npm install
call npm run dist:win
echo.
echo O instalador sera criado na pasta dist.
pause
