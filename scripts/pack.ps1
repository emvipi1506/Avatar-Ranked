$ErrorActionPreference = "Stop"
$destZip = "avatar-ranked-master-270styles.zip"
$artifactDir = "C:\Users\Phong\.gemini\antigravity-ide\brain\0316f334-7f32-4d19-b536-e83fa48bd2fb"

if (Test-Path $destZip) {
    Remove-Item $destZip -Force
}

Write-Host "Collecting files for ZIP..."
$excludeNames = @('node_modules', '.next', '.git', $destZip, 'avatar-ranked-upgraded.zip')

$itemsToZip = Get-ChildItem -Path . | Where-Object {
    $excludeNames -notcontains $_.Name
}

Compress-Archive -Path $itemsToZip -DestinationPath $destZip -CompressionLevel Optimal

if (Test-Path $destZip) {
    $zipInfo = Get-Item $destZip
    Write-Host "SUCCESS: Created $destZip (Size: $([math]::Round($zipInfo.Length / 1MB, 2)) MB)"
    
    if (Test-Path $artifactDir) {
        Copy-Item -Path $destZip -Destination (Join-Path $artifactDir $destZip) -Force
        Write-Host "SUCCESS: Copied to artifacts folder: $(Join-Path $artifactDir $destZip)"
    }
} else {
    Write-Error "Failed to generate ZIP file."
}
