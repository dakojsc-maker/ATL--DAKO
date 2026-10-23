@echo off
rem Quet co phieu mau DRI/MSR roi mo bao cao HTML. Them tuy chon phia sau, vd: chay-loc.bat --von 500
chcp 65001 >nul
cd /d "%~dp0"
set PY=python
where python >nul 2>nul || set PY=py
set OPTS=
if exist danh-muc.txt set OPTS=--danh-muc danh-muc.txt
%PY% loc_co_phieu.py %OPTS% %*
if exist ket-qua\moi-nhat.html start "" "ket-qua\moi-nhat.html"
pause
