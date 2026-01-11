import { test, expect } from "@playwright/test";

test("app loads and shows upload section", async ({ page }) => {
    await page.goto("/");

    await expect(
        page.getByRole("heading", { name: "Upload your file" })
    ).toBeVisible();
});
