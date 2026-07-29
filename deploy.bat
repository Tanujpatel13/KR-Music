@echo off
echo ========================================================
echo Preparing KR Music App for Deployment...
echo ========================================================

cd /d "%~dp0web"

echo.
echo Building the Next.js static app...
call npm run build

echo.
echo ========================================================
echo Publishing to Netlify!
echo ========================================================
echo.
echo Note: Netlify will open a browser window for you to log in securely.
echo Once logged in, you can close the browser and watch the terminal.
echo.
call npx netlify-cli deploy --prod --dir=out --no-build


echo.
echo ========================================================
echo Deployment Complete!
echo Look for the "Website Draft URL" or "Website URL" above!
echo ========================================================
pause
