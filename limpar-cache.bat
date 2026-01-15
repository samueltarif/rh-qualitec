@echo off
echo Limpando cache do Nuxt...
rmdir /s /q .nuxt 2>nul
rmdir /s /q node_modules\.cache 2>nul
rmdir /s /q .output 2>nul
echo Cache limpo!
echo.
echo Agora execute: npm run dev
pause
