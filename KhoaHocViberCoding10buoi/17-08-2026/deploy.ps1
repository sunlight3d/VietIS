param(
    [string]$HostIP = "103.195.238.76",
    [string]$Username = "root"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " BAT DAU DEPLOY LEN VPS $HostIP " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$sshArgs = @"
    cd /root;
    echo 'Dang tai script deploy.sh moi nhat...';
    curl -s -H 'Cache-Control: no-cache' https://raw.githubusercontent.com/sunlight3d/VietIS/master/KhoaHocViberCoding10buoi/17-08-2026/deploy.sh -o deploy.sh;
    chmod +x deploy.sh;
    ./deploy.sh
"@

$sshCommand = "ssh -t ${Username}@${HostIP} `"$sshArgs`""

Write-Host "Dang ket noi toi VPS va thuc thi lenh..." -ForegroundColor Yellow
Invoke-Expression $sshCommand

Write-Host "==========================================" -ForegroundColor Green
Write-Host " DEPLOY HOAN TAT! " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
