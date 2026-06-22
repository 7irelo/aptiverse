import { test as setup } from "@playwright/test";
import { authenticate } from "./_authenticate";

setup("tutor auth", async ({ page }) => authenticate("tutor", page));
