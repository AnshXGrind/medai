@echo off
echo ========================================
echo   MEDAID - Starting Development Server
echo ========================================
echo.
echo Server will start on http://localhost:8080
echo.
echo IMPORTANT: Keep this window open!
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

cd /d "%~dp0"
call npm run dev

pause
