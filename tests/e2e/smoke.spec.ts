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

test("host quiz reaches the contact step without sending data", async ({
  page,
}) => {
  await page.goto("/become-a-host");

  await page.getByRole("button", { name: "👥 Yes" }).click();
  await page
    .getByRole("button", { name: /It's a side project/ })
    .click();
  await page.getByRole("button", { name: "Next →" }).click();

  await expect(
    page.getByRole("heading", { name: "You're almost in! 🎉" }),
  ).toBeVisible();
  await expect(page.getByLabel("Your name")).toBeVisible();
});

test("unknown routes show the branded not-found page", async ({ page }) => {
  const response = await page.goto("/route-that-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This route is off the map" }),
  ).toBeVisible();
});
