import { test as setup } from "@playwright/test";
import { authenticate } from "./_authenticate";

setup("teacher auth", async ({ page }) => authenticate("teacher", page));
