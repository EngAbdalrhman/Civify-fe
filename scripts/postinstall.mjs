import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);

async function main() {
  try {
    console.log("📦 Starting postinstall script...");

    // Resolve chromium package location
    const chromiumResolvedPath = import.meta.resolve("@sparticuz/chromium");

    // Convert file:// URL to regular path
    let chromiumPath = chromiumResolvedPath.replace(/^file:\/\//, "");

    // Handle Windows paths (remove leading slash before drive letter)
    if (process.platform === "win32" && chromiumPath.match(/^\/[A-Za-z]:/)) {
      chromiumPath = chromiumPath.slice(1);
    }

    // Get the package root directory (goes up from build/esm/index.js to package root)
    const chromiumDir = dirname(dirname(dirname(chromiumPath)));
    const binDir = join(chromiumDir, "bin");

    if (!existsSync(binDir)) {
      console.log(
        "⚠️  Chromium bin directory not found, skipping archive creation",
      );
      return;
    }

    // Create tar archive in public folder
    const publicDir = join(projectRoot, "public");
    const outputPath = join(publicDir, "chromium-pack.tar");

    // Create public directory if it doesn't exist
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true });
    }

    console.log("📦 Creating chromium tar archive...");
    console.log("   Source:", binDir);
    console.log("   Output:", outputPath);

    // Use tar command (works on Windows with Git Bash/WSL, Linux, and Mac)
    try {
      execSync(`tar -cf "${outputPath}" -C "${binDir}" .`, {
        stdio: "inherit",
        cwd: projectRoot,
      });
      console.log("✅ Chromium archive created successfully!");
    } catch (tarError) {
      console.log("⚠️  tar command failed, trying alternative method...");
      // On Windows without tar, just log warning
      console.log("⚠️  Please ensure tar is available or run in WSL/Git Bash");
      console.log(
        "⚠️  Chromium archive creation skipped for local development",
      );
    }
  } catch (error) {
    console.error("❌ Failed to create chromium archive:", error.message);
    console.log("⚠️  This is not critical for local development");
    process.exit(0); // Don't fail the install
  }
}

main();
