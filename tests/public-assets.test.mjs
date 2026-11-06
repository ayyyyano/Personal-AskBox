import assert from "node:assert/strict";
import test from "node:test";
import worker from "../workers/entry.mjs";

function environment(body = "static page", status = 200) {
  const calls = [];
  return {
    calls,
    env: {
      get DB() { throw new Error("Root requests must not query D1"); },
      get ASKBOX_KV() { throw new Error("Root requests must not query KV"); },
      get ASKBOX_R2() { throw new Error("Root requests must not query R2"); },
      ASSETS: { async fetch(request) {
        calls.push({ url: request.url, method: request.method });
        return new Response(request.method === "HEAD" ? null : body, { status });
      } },
    },
  };
}

test("root GET serves a build asset without importing the Next renderer", async () => {
  const { env, calls } = environment();
  const response = await worker.fetch(new Request("https://askbox.test/?monitor=1"), env, {});
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
  assert.equal(response.headers.get("X-Askbox-Delivery"), "static-root");
  assert.match(response.headers.get("Content-Type"), /^text\/html/);
  assert.equal(await response.text(), "static page");
  assert.deepEqual(calls, [{ url: "https://askbox.test/__askbox/root.html", method: "GET" }]);
});

test("HEAD monitoring uses the same static path and returns no response body", async () => {
  const { env, calls } = environment();
  const response = await worker.fetch(new Request("https://askbox.test/", { method: "HEAD" }), env, {});
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, "HEAD");
});

test("unsupported root methods return 405 without initializing Next", async () => {
  const { env, calls } = environment();
  const response = await worker.fetch(new Request("https://askbox.test/", { method: "POST", body: "scan" }), env, {});
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "GET, HEAD");
  assert.equal(calls.length, 0);
});

test("client navigation receives RSC instead of HTML", async () => {
  const { env, calls } = environment("RSC payload");
  const response = await worker.fetch(new Request("https://askbox.test/?_rsc=abc", { headers: { RSC: "1" } }), env, {});
  assert.match(response.headers.get("Content-Type"), /^text\/x-component/);
  assert.match(response.headers.get("Vary"), /RSC/);
  assert.equal(new URL(calls[0].url).pathname, "/__askbox/root.rsc");
});

for (const [path, target] of [["/ask", "/"], ["/ask/", "/"], ["/display", "/#display"], ["/display/", "/#display"], ["/search?q=hello", "/?q=hello#display"]]) {
  test(`${path} redirects once to ${target} without rendering`, async () => {
    const { env, calls } = environment();
    const response = await worker.fetch(new Request(`https://askbox.test${path}`, { method: "HEAD" }), env, {});
    assert.equal(response.status, 308);
    assert.equal(response.headers.get("location"), `https://askbox.test${target}`);
    assert.equal(calls.length, 0);
  });
}

test("missing build assets fail with 503 instead of a redirect or runtime render", async () => {
  const { env, calls } = environment("missing", 404);
  const response = await worker.fetch(new Request("https://askbox.test/"), env, {});
  assert.equal(response.status, 503);
  assert.equal(calls.length, 1);
});
