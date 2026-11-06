import assert from "node:assert/strict";
import { mkdtemp, readFile, rmdir, unlink } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const require = createRequire(import.meta.url);
const minifyPath = require.resolve("@node-minify/core");
const minifyRequire = createRequire(minifyPath);
const { globSync } = minifyRequire("glob");
const pattern = fileURLToPath(new URL("../workers/*.mjs", import.meta.url)).replaceAll("\\", "/");

test("node-minify glob supports string and array patterns", () => {
  const expected = ["entry.mjs", "public-assets.mjs"];
  const filenames = (matches) => matches.map((path) => path.replaceAll("\\", "/").split("/").at(-1)).sort();
  assert.deepEqual(filenames(globSync(pattern)), expected);
  assert.deepEqual(filenames(globSync([pattern])), expected);
});

test("OpenNext's minifier dependencies compress JavaScript in memory", async () => {
  const minify = require("@node-minify/core");
  const terser = require("@node-minify/terser");
  const result = await minify({ compressor: terser, content: "console.log(1 + 2);" });
  assert.equal(result, "console.log(3);");
});

test("esbuild writes generated artifacts to disk", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "askbox-esbuild-"));
  const output = join(directory, "output.js");
  t.after(async () => {
    await unlink(output).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
    await rmdir(directory);
  });
  await require("esbuild").build({ stdin: { contents: "console.log(1 + 2);" }, outfile: output });
  assert.match(await readFile(output, "utf8"), /console\.log/);
});
