import { test as setup } from "@playwright/test";
import { authenticate } from "./_authenticate";

setup("school-admin auth", async ({ page }) => authenticate("school-admin", page));
