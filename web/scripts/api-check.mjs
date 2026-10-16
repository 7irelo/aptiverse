// CI guard: regenerates the API client and fails if the result differs from
// what is committed. Fix a failure by running `npm run api:gen` and committing.

import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

run("npm run api:gen");

const changes = execSync(
  "git status --porcelain -- src/lib/api/generated openapi",
  { encoding: "utf8" },
).trim();

if (changes) {
  console.error("Generated API client is out of date:\n" + changes);
  run("git --no-pager diff -- src/lib/api/generated");
  console.error("Run `npm run api:gen` and commit the result.");
  process.exit(1);
}

console.log("Generated API client matches the committed spec.");
