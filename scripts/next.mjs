import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);

if (process.platform === "win32" && !process.env.NEXT_TEST_WASM_DIR) {
  const wasmDir = resolve(root, "node_modules", "@next", "swc-wasm-nodejs");
  if (existsSync(join(wasmDir, "wasm.js"))) {
    process.env.NEXT_TEST_WASM_DIR = wasmDir;
  }
}

const nextBin = resolve(root, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, ...args], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
  shell: false
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
