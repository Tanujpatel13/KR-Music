@echo off
cd /d "%~dp0web"

echo Building the Next.js static app...
call npm run build

cd ..

echo.
echo ========================================================
echo STEP 1: Logging into Firebase... 
echo (A browser window will open for you to log in)
echo ========================================================
call npx firebase-tools login

echo.
echo ========================================================
echo STEP 2: Initializing Firebase Project
echo ========================================================
echo 1. Use your arrow keys to select "Hosting: Configure files for Firebase Hosting". Press SPACE to select, then ENTER.
echo 2. Select "Create a new project" (or use an existing one if you have it).
echo 3. When asked for the public directory, type: web/out
echo 4. Configure as a single-page app? Type: y
echo 5. Set up automatic builds and deploys with GitHub? Type: n
echo 6. Overwrite web/out/index.html? Type: n
echo ========================================================
call npx firebase-tools init hosting

echo.
echo ========================================================
echo STEP 3: Publishing to Firebase!
echo ========================================================
call npx firebase-tools deploy

echo.
echo ========================================================
echo Deployment Complete! Check the Hosting URL above.
echo ========================================================
pause
