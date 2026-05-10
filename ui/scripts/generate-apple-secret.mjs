// One-shot script: generate the Apple OAuth client_secret JWT.
//
// Apple requires the client_secret you give NextAuth to be a JWT signed
// with your downloaded .p8 key. The token is valid up to 6 months — set
// a calendar reminder to re-run this every 5 months.
//
// Usage:
//   1. Download your .p8 key from Apple Developer → Keys
//   2. Set the env vars below (or pass via CLI)
//   3. node ui/scripts/generate-apple-secret.mjs
//   4. Drop the printed JWT into ui/.env.local APPLE_CLIENT_SECRET
//
// Required env:
//   APPLE_TEAM_ID         — 10-char Team ID from Apple Developer
//   APPLE_KEY_ID          — 10-char Key ID from your .p8 download
//   APPLE_SERVICE_ID      — your Service ID (e.g. co.za.aptiverse.web)
//   APPLE_PRIVATE_KEY     — contents of the .p8 file (or path via APPLE_PRIVATE_KEY_PATH)

import { readFileSync } from "node:fs";
import { SignJWT, importPKCS8 } from "jose";

const teamId = process.env.APPLE_TEAM_ID;
const keyId = process.env.APPLE_KEY_ID;
const serviceId = process.env.APPLE_SERVICE_ID;

let privateKey = process.env.APPLE_PRIVATE_KEY;
if (!privateKey && process.env.APPLE_PRIVATE_KEY_PATH) {
  privateKey = readFileSync(process.env.APPLE_PRIVATE_KEY_PATH, "utf8");
}

if (!teamId || !keyId || !serviceId || !privateKey) {
  console.error(
    "Missing env. Need: APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_SERVICE_ID, APPLE_PRIVATE_KEY (or APPLE_PRIVATE_KEY_PATH).",
  );
  process.exit(1);
}

const key = await importPKCS8(privateKey, "ES256");
const now = Math.floor(Date.now() / 1000);

const jwt = await new SignJWT({})
  .setProtectedHeader({ alg: "ES256", kid: keyId })
  .setIssuer(teamId)
  .setIssuedAt(now)
  .setExpirationTime(now + 60 * 60 * 24 * 180) // 180 days, Apple max is 6 months
  .setAudience("https://appleid.apple.com")
  .setSubject(serviceId)
  .sign(key);

console.log(jwt);
