import { servePublicAsset } from "./public-assets.mjs";

const worker = {
  async fetch(request, env, ctx) {
    const response = await servePublicAsset(request, env);
    if (response) return response;
    const { default: openNext } = await import("../.open-next/worker.js");
    return openNext.fetch(request, env, ctx);
  },
};

export default worker;
