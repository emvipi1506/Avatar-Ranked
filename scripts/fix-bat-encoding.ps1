$batFiles = Get-ChildItem -Path "c:\Users\Phong\Roblox-Skin" -Filter "*.bat" -Recurse
foreach ($file in $batFiles) {
    $lines = Get-Content $file.FullName
    [System.IO.File]::WriteAllLines($file.FullName, $lines, [System.Text.Encoding]::ASCII)
    Write-Host "Da chuyen file CRLF: $($file.FullName)"
}
