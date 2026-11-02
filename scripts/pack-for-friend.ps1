$ErrorActionPreference = "Stop"
$rootDir = "c:\Users\Phong\Roblox-Skin"
$destZip = Join-Path $rootDir "Avatar-Ranked-Live-Gui-Ban.zip"

if (Test-Path $destZip) {
    Remove-Item $destZip -Force
}

Write-Host "Dang chuan bi dong goi file ZIP..." -ForegroundColor Cyan

# Tao thu muc tam
$tempFolder = Join-Path $env:TEMP "avatar_ranked_pack"
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder | Out-Null

# Copy cac file tien ich ngoai thu muc goc
Copy-Item (Join-Path $rootDir "Chay_Live.bat") $tempFolder -Force
Copy-Item (Join-Path $rootDir "1_Cai_NodeJS_Tu_Dong.bat") $tempFolder -Force
Copy-Item (Join-Path $rootDir "Tao_Icon_Desktop.bat") $tempFolder -Force
Copy-Item (Join-Path $rootDir "Huong_Dan_Cho_Ban_Streamer.txt") $tempFolder -Force

# Copy thu muc code avatar-ranked (bo qua node_modules, .next, .git)
$targetAvatarDir = Join-Path $tempFolder "avatar-ranked"
New-Item -ItemType Directory -Path $targetAvatarDir | Out-Null

$exclude = @("node_modules", ".next", ".git", "*.zip")

Get-ChildItem -Path (Join-Path $rootDir "avatar-ranked") -Exclude $exclude | ForEach-Object {
    if ($_.Name -notin @("node_modules", ".next", ".git")) {
        Copy-Item -Path $_.FullName -Destination $targetAvatarDir -Recurse -Force
    }
}

Write-Host "Dang nen file ZIP: $destZip ..." -ForegroundColor Cyan
Compress-Archive -Path "$tempFolder\*" -DestinationPath $destZip -CompressionLevel Optimal

Remove-Item $tempFolder -Recurse -Force

if (Test-Path $destZip) {
    $sizeMb = [math]::Round((Get-Item $destZip).Length / 1MB, 2)
    Write-Host "HOAN TAT: Da tao $destZip (Kich thuoc: $sizeMb MB)" -ForegroundColor Green
} else {
    Write-Error "Loi khi tao file ZIP"
}
