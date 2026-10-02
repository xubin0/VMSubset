@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

where npm >nul 2>&1
if errorlevel 1 (
  echo npm was not found. Install Node.js LTS and try again.
  pause
  exit /b 1
)

start "VMSubset Backend" /D "%BACKEND%" cmd /k "set PORT=5002&& npm start"
start "VMSubset Frontend" /D "%FRONTEND%" cmd /k "npm run dev -- --host 127.0.0.1"

echo Starting VMSubset...
timeout /t 5 /nobreak >nul
start "" "http://127.0.0.1:5173/"

echo.
echo VMSubset is starting at http://127.0.0.1:5173/
echo Keep the Backend and Frontend windows open while using the application.
endlocal
