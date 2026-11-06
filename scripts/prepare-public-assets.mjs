import { copyFile, mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL(".next/prerender-manifest.json", root), "utf8"));
if (manifest.routes["/"]?.initialRevalidateSeconds !== false) {
  throw new Error("The public root must be statically prerendered without runtime revalidation.");
}
const output = new URL(".open-next/assets/__askbox/", root);
await mkdir(output, { recursive: true });
for (const [source, target] of [["index.html", "root.html"], ["index.rsc", "root.rsc"]]) {
  await copyFile(new URL(`.next/server/app/${source}`, root), new URL(target, output));
}
console.log(`Public HTML and RSC copied to ${fileURLToPath(output)}`);
