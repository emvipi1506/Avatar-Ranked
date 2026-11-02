@echo off
setlocal
chcp 65001 >nul 2>&1
title [AVATAR RANKED] - LIVE STREAM STUDIO
color 0b

echo ================================================================
echo    AVATAR RANKED -- HE THONG HO TRO LIVESTREAM ROBLOX
echo ================================================================
echo.

:: 1. Kiem tra xem co dang chay trong thu muc Temp (chua giai nen ZIP)
echo "%~dp0" | findstr /i "AppData\\Local\\Temp" >nul
if %errorlevel% equ 0 goto :error_in_zip

:: 2. Di chuyen vao thu muc avatar-ranked
if exist "%~dp0avatar-ranked\package.json" (
    cd /d "%~dp0avatar-ranked"
) else (
    cd /d "%~dp0"
)

:: 3. Them duong dan Node.js vao PATH neu can
if exist "%ProgramFiles%\nodejs\node.exe" (
    set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%PATH%"
)
if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
    set "PATH=%ProgramFiles(x86)%\nodejs;%APPDATA%\npm;%PATH%"
)
if exist "%LocalAppData%\Programs\nodejs\node.exe" (
    set "PATH=%LocalAppData%\Programs\nodejs;%PATH%"
)

:: 4. Kiem tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 goto :missing_node

:: 5. Kiem tra node_modules
if not exist "node_modules\" goto :install_modules

goto :start_server

:missing_node
color 0e
echo ================================================================
echo [THONG BAO] May tinh cua ban chua co Node.js!
echo ================================================================
echo.
echo Dang tu dong mo trinh cai dat Node.js cho ban...
echo.
if exist "%~dp01_Cai_NodeJS_Tu_Dong.bat" (
    call "%~dp01_Cai_NodeJS_Tu_Dong.bat"
    goto :end
)
if exist "%~dp0..\1_Cai_NodeJS_Tu_Dong.bat" (
    call "%~dp0..\1_Cai_NodeJS_Tu_Dong.bat"
    goto :end
)
start https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi
echo.
echo Sau khi cai xong Node.js, ban hay mo lai file Chay_Live.bat nay nhe!
echo.
pause
exit /b

:install_modules
echo [THONG BAO] Phat hien lan dau chay! Dang cai dat thu vien (mat 1-2 phut)...
echo Xin vui long cho, khong tat cua so nay...
echo.
call npm install
if %errorlevel% neq 0 goto :error_npm
goto :start_server

:start_server
echo [1/2] May chu dang khoi dong...
echo [2/2] Tu dong mo trinh duyet sau 4 giay...
echo.
echo ================================================================
echo    HUONG DAN CHO BAN STREAMER:
echo.
echo    * TAB 1 (BXH Live): http://localhost:3000/live
echo      - Chieu toan man hinh cho Viewer xem.
echo      - Hoac them vao OBS Browser Source.
echo.
echo    * TAB 2 (Cham Avatar): http://localhost:3000/
echo      - Nhap ten Roblox, xem diem, bam "DUA VAO BXH LIVE".
echo.
echo    * KHI DUNG STREAM: Chi can dong cua so nay lai la xong!
echo ================================================================
echo.

:: Hen gio tu dong mo 2 tab
start "" cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:3000/live && timeout /t 1 /nobreak >nul && start http://localhost:3000"

:: Khoi chay server
call npm run dev
if %errorlevel% neq 0 goto :error_server
goto :end

:error_in_zip
color 0c
echo ================================================================
echo [LOI] BAN CHUA GIAI NEN FILE ZIP!
echo ================================================================
echo Ban dang mo file truc tiep ben trong file nen nen Windows khong chay duoc.
echo.
echo Cach khac phuc:
echo   1. Ra ngoai file Avatar-Ranked-Live-Gui-Ban.zip
echo   2. Click chuot phai vao file, chon 'Extract All...' (Giai nen)
echo   3. Vao thu muc da giai nen roi moi click vao Chay_Live.bat nhe!
echo ================================================================
echo.
pause
exit /b

:error_npm
color 0c
echo ================================================================
echo [LOI] Khong the tai thu vien qua mang.
echo Vui long kiem tra ket noi Internet va thu chay lai file nay.
echo ================================================================
echo.
pause
exit /b

:error_server
color 0c
echo ================================================================
echo [LOI] May chu bi dung hoac xay ra loi khi khoi dong.
echo ================================================================
echo.
pause
exit /b

:end
pause
