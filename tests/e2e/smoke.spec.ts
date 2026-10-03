import { expect, test } from "@playwright/test";

test("home page leads to the trip catalog", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Group Travel for Every Community",
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Book a Trip" }).click();
  await expect(page).toHaveURL("/trips");
  await expect(
    page.getByRole("heading", { name: "Find your next group trip" }),
  ).toBeVisible();
});

test("trip search preserves the query and narrows the prototype catalog", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("searchbox", { name: "Destination or trip" }).fill("Bali");
  await page.getByRole("button", { name: "Find a Trip" }).click();

  await expect(page).toHaveURL(/\/trips\?q=Bali/);
  await expect(page.getByRole("heading", { name: "1 trip found" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /View Bali with Diem/ }),
  ).toBeVisible();
});

test("host application moves from audience to reach without sending data", async ({
  page,
}) => {
  await page.goto("/become-a-host");

  await expect(
    page.getByRole("heading", { name: "Tell us about your audience" }),
  ).toBeVisible();
  await page.getByLabel(/Community or Brand Name/).fill("Nomad Creatives Club");
  await page.getByRole("button", { name: "newsletter" }).click();
  await page
    .getByRole("button", { name: /Continue to Audience & Reach/ })
    .click();

  await expect(
    page.getByRole("heading", { name: "Audience size & social handles" }),
  ).toBeVisible();
});

test("unknown routes show the branded not-found page", async ({ page }) => {
  const response = await page.goto("/route-that-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Looks like you've wandered off the trail" }),
  ).toBeVisible();
});
