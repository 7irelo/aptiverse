import { test as setup } from "@playwright/test";
import { authenticate } from "./_authenticate";

setup("student auth", async ({ page }) => authenticate("student", page));
