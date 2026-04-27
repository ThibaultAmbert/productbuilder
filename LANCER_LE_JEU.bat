@echo off
chcp 65001 >nul
title Zodiac Game

echo.
echo  ✨  Zodiac Game - Démarrage...
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  ❌  Node.js n'est pas installé !
    echo.
    echo  Téléchargez-le gratuitement ici :
    echo  https://nodejs.org  (prendre la version LTS)
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo  📦  Installation des dépendances (première fois)...
    npm install
    echo.
)

echo  🚀  Serveur lancé sur http://localhost:3000
echo.
echo  ─────────────────────────────────────────────
echo  Ouvrez ce lien dans votre navigateur :
echo  http://localhost:3000
echo.
echo  Pour jouer en équipe, donnez votre adresse IP
echo  locale à vos collègues (ex: http://192.168.x.x:3000)
echo  ─────────────────────────────────────────────
echo.
echo  Appuyez sur Ctrl+C pour arrêter le serveur.
echo.

node server.js
pause
