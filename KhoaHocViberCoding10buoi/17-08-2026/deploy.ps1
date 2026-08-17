param(
    [string]$HostIP = "103.195.238.76",
    [string]$Username = "root"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " BAT DAU DEPLOY LEN VPS $HostIP " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$sshArgs = @"
    cd /root;
    echo '1. Xoa ma nguon cu tren VPS...';
    rm -rf /root/VietIS_new;

    echo '2. Tien hanh Clone code moi nhat tu GitHub...';
    git clone --progress https://github.com/sunlight3d/VietIS.git /root/VietIS_new;

    echo '3. Chuan bi va thuc thi deploy script...';
    cp /root/VietIS_new/KhoaHocViberCoding10buoi/17-08-2026/deploy.sh /root/deploy_temp.sh;
    chmod +x /root/deploy_temp.sh;
    ./deploy_temp.sh
"@

$sshCommand = "ssh -t ${Username}@${HostIP} `"$sshArgs`""

Write-Host "Dang ket noi toi VPS va thuc thi lenh..." -ForegroundColor Yellow
Invoke-Expression $sshCommand

Write-Host "==========================================" -ForegroundColor Green
Write-Host " DEPLOY HOAN TAT! " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
