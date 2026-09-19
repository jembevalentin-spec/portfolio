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
echo Building Jembe...
call npm run build
if errorlevel 1 goto :error
echo.
echo BUILD SUCCESSFUL.
pause
exit /b 0
:error
echo.
echo BUILD FAILED. Check the error above.
pause
exit /b 1
