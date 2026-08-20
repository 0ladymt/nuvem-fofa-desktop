@echo off
chcp 65001 >nul
where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js nao foi encontrado neste computador.
  echo Instale o Node.js LTS em https://nodejs.org e execute este arquivo novamente.
  echo.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando o motor desktop do Nuvem Fofa...
  call npm install
  if errorlevel 1 pause & exit /b 1
)
call npm start
