@echo off
echo ========================================
echo [1] Menjalankan Vite Dev Server...
echo ========================================
start cmd /k "cd /d %CD% && npm run dev -- --host"

timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo [2] Menjalankan Ngrok di Port 5173...
echo ========================================
npx ngrok http 5173

pause
