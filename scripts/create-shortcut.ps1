$ws = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$shortcutPath = Join-Path $desktop "Avatar Ranked Live.lnk"
$targetPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Chay_Live.bat"
$workingDir = Split-Path $PSScriptRoot -Parent

$shortcut = $ws.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.WorkingDirectory = $workingDir
$shortcut.Description = "Mở Avatar Ranked Live Stream Studio"
$shortcut.Save()

Write-Host "Da tao bieu tuong thanh cong ngoai Desktop: $shortcutPath" -ForegroundColor Green
