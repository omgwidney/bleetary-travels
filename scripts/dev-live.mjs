import nextEnv from "@next/env";
import { spawn } from "node:child_process";
nextEnv.loadEnvConfig(process.cwd());
const env = { ...process.env, NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false", NEXT_DIST_DIR: ".next-live", ALLOW_MOCK_CHECKOUT: "false" };
// Empty overrides prevent Next from restoring local emulator settings from .env.local.
for (const key of ["FIREBASE_AUTH_EMULATOR_HOST", "FIRESTORE_EMULATOR_HOST", "FIREBASE_STORAGE_EMULATOR_HOST"]) env[key] = "";
console.log("Using LIVE Firebase accounts and data. Payments require configured Stripe credentials.");
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--webpack", ...process.argv.slice(2)], { env, stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", code => process.exit(code ?? 0));
