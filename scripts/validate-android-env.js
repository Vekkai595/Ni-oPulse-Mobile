import { resolveAndroidApiBase } from "./android-env.js";

try {
  const apiBase = resolveAndroidApiBase();
  console.log(apiBase ? `Android API target: ${apiBase}` : "Android uses official sources directly.");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
