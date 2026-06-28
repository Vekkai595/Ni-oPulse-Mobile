import { assertAndroidApiBase, resolveAndroidApiBase } from "./android-env.js";

try {
  const apiBase = assertAndroidApiBase(resolveAndroidApiBase());
  console.log(`Android API target: ${apiBase}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
