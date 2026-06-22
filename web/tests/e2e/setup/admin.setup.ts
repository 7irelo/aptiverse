import { test as setup } from "@playwright/test";
import { authenticate } from "./_authenticate";

setup("admin auth", async ({ page }) => authenticate("admin", page));
