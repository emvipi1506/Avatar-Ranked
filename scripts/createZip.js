import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const tempExportDir = path.resolve(__dirname, "../temp_export_zip");
const zipOutputFile = path.resolve(rootDir, "../avatar-ranked-final-upgraded.zip");

if (fs.existsSync(tempExportDir)) {
  fs.rmSync(tempExportDir, { recursive: true, force: true });
}
fs.mkdirSync(tempExportDir, { recursive: true });

function copyFiltered(srcDir, destDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    // Bỏ qua các thư mục và file không cần thiết / nhạy cảm
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".git" ||
      entry.name === "temp_export_zip" ||
      entry.name.startsWith(".env") ||
      entry.name.endsWith(".zip")
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyFiltered(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log("Copying clean project files to temporary staging folder...");
copyFiltered(rootDir, tempExportDir);

console.log("Creating ZIP archive using PowerShell Compress-Archive...");
if (fs.existsSync(zipOutputFile)) {
  fs.unlinkSync(zipOutputFile);
}

const powershellCmd = `powershell -Command "Compress-Archive -Path '${tempExportDir}\\*' -DestinationPath '${zipOutputFile}' -Force"`;
execSync(powershellCmd, { stdio: "inherit" });

const stats = fs.statSync(zipOutputFile);
console.log(`Successfully created ZIP archive: ${zipOutputFile} (${stats.size} bytes)`);

// Cleanup staging folder
fs.rmSync(tempExportDir, { recursive: true, force: true });
console.log("Cleaned up staging folder.");
