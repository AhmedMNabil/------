@echo off
echo ====================================================
echo Starting SSH Tunnel to Backend Server (Port 7000)...
echo Keep this window open while developing.
echo ====================================================
ssh -i "%USERPROFILE%\.ssh\corsatdev" -o StrictHostKeyChecking=no -N -L 7000:localhost:7000 corsatdev@63.184.29.99
