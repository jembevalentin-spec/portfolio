@echo off
setlocal
cd /d "%~dp0"
if not exist package.json (
  echo ERROR: Run this file from the Jembe project root containing package.json.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 goto :error
)
echo Starting Jembe local server...
call npm run dev
if errorlevel 1 goto :error
exit /b 0
:error
echo.
echo Jembe could not start. Check the message above.
pause
exit /b 1
