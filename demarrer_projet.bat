@echo off
chcp 65001 >nul
echo ===================================================
echo   Lancement de CityReserve (Backend + Frontend)
echo ===================================================

echo 1. Demarrage du serveur Backend Django (Port 8000)...
start "CityReserve - Backend Django" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate.bat && python manage.py runserver 8000"

echo 2. Demarrage du serveur Frontend React (Port 3000)...
start "CityReserve - Frontend React" cmd /k "cd /d "%~dp0" && npm start"

echo.
echo En attente de l'initialisation des serveurs...
timeout /t 6 /nobreak >nul

echo 3. Ouverture de l'application et de l'administration Django...
start http://localhost:3000
start http://localhost:8000/api/admin/

echo.
echo ===================================================
echo Serveurs lances avec succes !
echo - Application Web : http://localhost:3000
echo - Admin Django : http://localhost:8000/api/admin/
echo.
echo IMPORTANT : Ne fermez PAS les fenetres de terminal
echo ouvertes en arriere-plan, sinon les serveurs s'arretent !
echo ===================================================
pause
