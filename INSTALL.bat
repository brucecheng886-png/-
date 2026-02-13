@echo off
chcp 65001 >nul
REM =============================================
REM BruV Enterprise v4.0 — 一鍵安裝（雙擊即用）
REM =============================================
REM 此檔案僅是 INSTALL.ps1 的啟動器
REM 如遇問題，請以系統管理員身份執行

title BruV Enterprise — 安裝程式

echo.
echo  正在啟動 BruV 安裝程式...
echo.

cd /d "%~dp0"

REM 嘗試以 Bypass 執行 PowerShell 腳本
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0INSTALL.ps1" %*

if %errorlevel% neq 0 (
    echo.
    echo  安裝過程中出現錯誤（錯誤碼: %errorlevel%）
    echo  請檢查上方的錯誤訊息
    echo.
    pause
)
