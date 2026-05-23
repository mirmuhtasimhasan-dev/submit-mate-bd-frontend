@echo off
cd /d %~dp0
if not exist node_modules (
  echo Installing frontend dependencies...
  npm install
)
echo Starting Submit Mate BD Frontend...
npm run dev
pause
