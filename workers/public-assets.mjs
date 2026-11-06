export async function servePublicAsset(request, env) {
  const url = new URL(request.url);
  if (request.method !== "GET" && request.method !== "HEAD") {
    return url.pathname === "/" ? new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } }) : null;
  }
  if (url.pathname === "/ask" || url.pathname === "/ask/") return Response.redirect(new URL("/", url), 308);
  if (url.pathname === "/display" || url.pathname === "/display/") return Response.redirect(new URL("/#display", url), 308);
  if (url.pathname === "/search" || url.pathname === "/search/") {
    const target = new URL("/#display", url);
    target.search = url.search;
    return Response.redirect(target, 308);
  }
  if (url.pathname !== "/") return null;

  const rsc = request.headers.get("RSC") === "1";
  const assetUrl = new URL(rsc ? "/__askbox/root.rsc" : "/__askbox/root.html", url);
  const asset = await env.ASSETS.fetch(new Request(assetUrl, { method: request.method }));
  if (!asset.ok && asset.status !== 304) return new Response("Public page asset unavailable", { status: 503 });
  const response = new Response(asset.body, asset);
  response.headers.set("Content-Type", rsc ? "text/x-component; charset=utf-8" : "text/html; charset=utf-8");
  response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  response.headers.set("Vary", "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch");
  response.headers.set("X-Askbox-Delivery", "static-root");
  return response;
}
