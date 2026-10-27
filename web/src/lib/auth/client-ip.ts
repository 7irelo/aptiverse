/**
 * The real visitor IP, so the API's per-IP rate limits see people rather
 * than the web server. The API only honours X-Forwarded-For from its
 * configured KnownProxies, so a spoofed value from anywhere else is ignored.
 *
 * Where the IP comes from depends on the hosting edge (CLIENT_IP_SOURCE):
 * - "x-real-ip" (default): Vercel and most edges overwrite this header, so
 *   a value sent by the browser never survives.
 * - "x-forwarded-for-last": the last hop appended by a trusted load balancer.
 * - "none": send nothing.
 */
const IP_PATTERN = /^[0-9a-fA-F:.]{2,45}$/;

export function clientIpFrom(headers: Headers): string | undefined {
  const source = process.env.CLIENT_IP_SOURCE ?? "x-real-ip";
  let candidate: string | undefined;
  if (source === "x-real-ip") {
    candidate = headers.get("x-real-ip") ?? undefined;
  } else if (source === "x-forwarded-for-last") {
    candidate = headers.get("x-forwarded-for")?.split(",").pop();
  }
  candidate = candidate?.trim();
  return candidate && IP_PATTERN.test(candidate) ? candidate : undefined;
}

/** Headers every server-side API call carries: client IP and trace context. */
export function upstreamContextHeaders(
  incoming: Headers,
): Record<string, string> {
  const out: Record<string, string> = {};
  const ip = clientIpFrom(incoming);
  if (ip) out["x-forwarded-for"] = ip;
  for (const name of ["traceparent", "tracestate", "x-request-id"]) {
    const value = incoming.get(name);
    if (value && value.length <= 256) out[name] = value;
  }
  return out;
}
