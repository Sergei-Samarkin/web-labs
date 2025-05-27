@echo off
cd /d %~dp0\..\backend
if errorlevel 1 exit /b 1
echo Running lint-staged in %CD%
npm run lint-staged
