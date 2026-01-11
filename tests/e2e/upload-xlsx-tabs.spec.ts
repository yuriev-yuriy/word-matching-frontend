import { test, expect } from "@playwright/test";
import path from "node:path";

test("xlsx upload shows sheet tabs and right arrow on overflow", async ({ page }) => {
    // 👇 ГАРАНТИРУЕМ overflow
    await page.setViewportSize({ width: 375, height: 800 });

    await page.goto("/");

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();

    const xlsxPath = path.resolve("tests/e2e/fixtures/many-sheets.xlsx");
    await fileInput.setInputFiles(xlsxPath);

    // Проверяем, что табы появились
    await expect(
        page.getByRole("button", { name: "Sheet 1" })
    ).toBeVisible();

    // Теперь overflow гарантирован → стрелка обязана быть
    await expect(
        page.getByRole("button", { name: "Scroll sheets right" })
    ).toBeVisible();
});
