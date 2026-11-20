@echo off
chcp 65001 >nul
title Deploy - Delivery Sem Taxa

echo ============================================
echo   DEPLOY - Delivery Sem Taxa
echo ============================================
echo.

:: ---------- Check wrangler ----------
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] npx nao encontrado. Instale o Node.js primeiro.
    echo https://nodejs.org/
    pause
    exit /b 1
)

:: ---------- Menu ----------
echo Escolha o que deseja fazer:
echo.
echo   [1] Deploy do Worker (API backend)
echo   [2] Deploy do Pages (Landing page)
echo   [3] Deploy TUDO (Worker + Pages)
echo   [4] Criar banco D1 (primeira vez)
echo   [5] Sair
echo.
set /p opcao="Opcao: "

if "%opcao%"=="1" goto deploy_worker
if "%opcao%"=="2" goto deploy_pages
if "%opcao%"=="3" goto deploy_all
if "%opcao%"=="4" goto setup_d1
if "%opcao%"=="5" exit /b 0

echo Opcao invalida.
pause
exit /b 1

:: ============================================
:: SETUP D1 (primeira vez)
:: ============================================
:setup_d1
echo.
echo ============================================
echo   CRIANDO BANCO D1...
echo ============================================
echo.

cd /d "%~dp0worker"

echo [1/3] Criando database D1 "diag-leads"...
npx wrangler d1 create diag-leads

echo.
echo ============================================
echo   IMPORTANTE: Copie o "database_id" acima
echo   e cole no arquivo worker\wrangler.toml
echo   na linha: database_id = "COLE_AQUI"
echo ============================================
echo.
set /p db_id="Cole o database_id aqui (ou Enter pra pular): "

if not "%db_id%"=="" (
    echo Atualizando wrangler.toml...
    powershell -Command "(Get-Content 'wrangler.toml') -replace 'REPLACE_WITH_YOUR_D1_DATABASE_ID', '%db_id%' | Set-Content 'wrangler.toml'"
    echo [OK] wrangler.toml atualizado!
)

echo.
echo [2/3] Executando schema.sql no D1...
npx wrangler d1 execute diag-leads --remote --file=schema.sql

echo.
echo [3/3] Banco criado com sucesso!
echo.
pause
goto menu_voltar

:: ============================================
:: DEPLOY WORKER
:: ============================================
:deploy_worker
echo.
echo ============================================
echo   DEPLOY DO WORKER (API)
echo ============================================
echo.

cd /d "%~dp0worker"

echo Fazendo deploy do Worker...
npx wrangler deploy

if %errorlevel% equ 0 (
    echo.
    echo [OK] Worker publicado com sucesso!
    echo.
    echo LEMBRE-SE: Copie a URL do Worker e cole em
    echo   js\api.js na constante API_BASE_URL
) else (
    echo.
    echo [ERRO] Falha no deploy do Worker.
)

echo.
pause
goto menu_voltar

:: ============================================
:: DEPLOY PAGES
:: ============================================
:deploy_pages
echo.
echo ============================================
echo   DEPLOY DO PAGES (Landing Page)
echo ============================================
echo.

cd /d "%~dp0"

echo Fazendo deploy da landing page no Cloudflare Pages...
echo Projeto: delivery-sem-taxa
echo Diretorio: . (raiz, excluindo worker/)
echo.

npx wrangler pages deploy . --project-name=delivery-sem-taxa --commit-dirty=true

if %errorlevel% equ 0 (
    echo.
    echo [OK] Landing page publicada com sucesso!
    echo Acesse o painel do Cloudflare para ver a URL.
) else (
    echo.
    echo [ERRO] Falha no deploy da landing page.
)

echo.
pause
goto menu_voltar

:: ============================================
:: DEPLOY TUDO
:: ============================================
:deploy_all
echo.
echo ============================================
echo   DEPLOY COMPLETO (Worker + Pages)
echo ============================================
echo.

:: Worker primeiro
cd /d "%~dp0worker"

echo [1/2] Deploy do Worker (API)...
echo.
npx wrangler deploy

if %errorlevel% neq 0 (
    echo [ERRO] Falha no deploy do Worker. Abortando.
    pause
    goto menu_voltar
)
echo.
echo [OK] Worker publicado!
echo.

:: Pages depois
cd /d "%~dp0"

echo [2/2] Deploy do Pages (Landing)...
echo.
npx wrangler pages deploy . --project-name=delivery-sem-taxa --commit-dirty=true

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo   TUDO PUBLICADO COM SUCESSO!
    echo ============================================
    echo.
    echo Proximos passos:
    echo   1. Copie a URL do Worker e cole em js\api.js
    echo   2. Faca o re-deploy do Pages se mudou o api.js
    echo   3. Teste o diagnostico no site publicado
) else (
    echo.
    echo [ERRO] Falha no deploy do Pages.
)

echo.
pause
goto menu_voltar

:menu_voltar
cd /d "%~dp0"
goto :eof
