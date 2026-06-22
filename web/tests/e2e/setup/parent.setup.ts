import { test as setup } from "@playwright/test";
import { authenticate } from "./_authenticate";

setup("parent auth", async ({ page }) => authenticate("parent", page));
