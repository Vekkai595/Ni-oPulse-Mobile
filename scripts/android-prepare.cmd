@echo off
call npm run android:prepare
exit /b %errorlevel%
