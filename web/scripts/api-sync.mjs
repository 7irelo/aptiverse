// Syncs openapi/api-spec.json from the API.
//
// Source, in order of preference:
//   1. API_SPEC_URL (a pinned, versioned spec URL, for example a GitHub
//      release asset published by aptiverse-labs/api CI)
//   2. ../api/openapi/v1.json (a sibling checkout of the API repo)
// If neither is available the committed spec is left as it is.
//
// After syncing, run `npm run api:gen` to regenerate the client.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(root, "openapi/api-spec.json");
const sibling = resolve(root, "../api/openapi/v1.json");

function write(json, from) {
  const parsed = JSON.parse(json);
  if (!parsed.openapi || !parsed.paths) {
    throw new Error(`${from} does not look like an OpenAPI document`);
  }
  writeFileSync(target, `${JSON.stringify(parsed, null, 2)}\n`);
  console.log(`api:sync wrote openapi/api-spec.json from ${from}`);
}

const url = process.env.API_SPEC_URL;

if (url) {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(
      `api:sync could not download ${url} (status ${response.status})`,
    );
    process.exit(1);
  }
  write(await response.text(), url);
} else if (existsSync(sibling)) {
  write(readFileSync(sibling, "utf8"), "../api/openapi/v1.json");
} else {
  console.log(
    "api:sync found no source (set API_SPEC_URL or check out the API next to this repo). Keeping the committed spec.",
  );
}
