import { headers } from "next/headers";

function firstHeaderValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim() ?? "";
}

export async function getSiteUrl() {
  const requestHeaders = await headers();
  const host = firstHeaderValue(requestHeaders.get("x-forwarded-host")) || firstHeaderValue(requestHeaders.get("host"));
  if (!host) return "当前站点";

  const forwardedProtocol = firstHeaderValue(requestHeaders.get("x-forwarded-proto"));
  const protocol = forwardedProtocol === "http" || forwardedProtocol === "https"
    ? forwardedProtocol
    : /^(localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?$/i.test(host)
      ? "http"
      : "https";

  return `${protocol}://${host}`;
}
