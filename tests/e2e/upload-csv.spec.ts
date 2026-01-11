import { test, expect } from "@playwright/test";
import path from "node:path";

test("user can upload CSV and see first word", async ({ page }) => {
    await page.goto("/");

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();

    const csvPath = path.resolve("tests/e2e/fixtures/sample.csv");
    await fileInput.setInputFiles(csvPath);

    // Проверяем, что появился хотя бы один загруженный word
    await expect(
        page.getByText("cat", { exact: true })
    ).toBeVisible();
});
