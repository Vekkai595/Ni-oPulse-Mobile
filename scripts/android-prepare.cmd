@echo off
setlocal
call npm run android:config
if errorlevel 1 exit /b %errorlevel%
call npm run build
if errorlevel 1 exit /b %errorlevel%
call npm run android:sync
if errorlevel 1 exit /b %errorlevel%
echo.
echo Android project prepared successfully.
endlocal
