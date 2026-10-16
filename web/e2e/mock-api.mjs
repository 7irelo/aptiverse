// Minimal stand-in for the Aptiverse API used by Playwright. The help page
// fetches FAQs on the server, so browser route interception cannot see that
// request; instead Next.js is started with API_INTERNAL_URL pointing here.

import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const port = Number(process.env.MOCK_API_PORT ?? 5199);
const faqs = readFileSync(
  new URL("../tests/fixtures/faqs.json", import.meta.url),
  "utf8",
);

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "content-type": "text/plain" }).end("ok");
    return;
  }

  if (req.method === "GET" && url.pathname === "/support/faqs") {
    res.writeHead(200, { "content-type": "application/json" }).end(faqs);
    return;
  }

  res
    .writeHead(404, { "content-type": "application/problem+json" })
    .end(JSON.stringify({ title: "Not Found", status: 404 }));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`mock API listening on http://127.0.0.1:${port}`);
});
