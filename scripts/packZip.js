import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rootDir = process.cwd();
const zipOutputName = "avatar-ranked-master-270styles.zip";
const zipOutputPath = path.join(rootDir, zipOutputName);
const artifactsDir = "C:\\Users\\Phong\\.gemini\\antigravity-ide\\brain\\0316f334-7f32-4d19-b536-e83fa48bd2fb";
const artifactZipPath = path.join(artifactsDir, zipOutputName);

console.log("Preparing to pack project into ZIP...");

// Remove old zip if exists
if (fs.existsSync(zipOutputPath)) fs.unlinkSync(zipOutputPath);

// PowerShell script to create clean zip excluding node_modules and .next
const psCommand = `
$exclude = @('node_modules', '.next', '.git', '${zipOutputName}', 'avatar-ranked-upgraded.zip')
$files = Get-ChildItem -Path . -Recurse | Where-Object {
    $item = $_
    $skip = $false
    foreach ($ex in $exclude) {
        if ($item.FullName -like "*\\$ex*" -or $item.FullName -like "*\\$ex") {
            $skip = $true
            break
        }
    }
    -not $skip
}

Compress-Archive -Path $files.FullName -DestinationPath "${zipOutputPath}" -Force
`;

try {
  execSync(`powershell -NoProfile -Command "${psCommand.replace(/\n/g, " ")}"`, {
    cwd: rootDir,
    stdio: "inherit",
  });

  if (fs.existsSync(zipOutputPath)) {
    const stats = fs.statSync(zipOutputPath);
    console.log(`ZIP created successfully at: ${zipOutputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    // Copy to artifacts dir
    if (fs.existsSync(artifactsDir)) {
      fs.copyFileSync(zipOutputPath, artifactZipPath);
      console.log(`Copied ZIP to artifacts dir: ${artifactZipPath}`);
    }
  } else {
    throw new Error("ZIP file was not created.");
  }
} catch (err) {
  console.error("Error creating zip:", err);
  process.exit(1);
}
