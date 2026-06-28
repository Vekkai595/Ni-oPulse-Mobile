import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { platform } from "node:os";
import { fileURLToPath } from "node:url";

const target = process.argv[2];
const task = target === "aab" ? "bundleRelease" : target === "apk" ? "assembleDebug" : null;
if (!task) {
  console.error("Usage: node scripts/android-build.js apk|aab");
  process.exit(1);
}

const androidDir = fileURLToPath(new URL("../android/", import.meta.url));
if (target === "aab" && !existsSync(new URL("../android/keystore.properties", import.meta.url))) {
  console.error([
    "Signed AAB build stopped: android/keystore.properties is missing.",
    "Copy android/keystore.properties.example, fill it with your private upload-key details, and keep both the file and .jks out of Git.",
  ].join("\n"));
  process.exit(1);
}

const executable = platform() === "win32" ? "gradlew.bat" : "./gradlew";
const result = spawnSync(executable, [task], {
  cwd: androidDir,
  stdio: "inherit",
  shell: platform() === "win32",
});
process.exit(result.status ?? 1);
