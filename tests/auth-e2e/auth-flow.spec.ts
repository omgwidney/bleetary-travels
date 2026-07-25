import { expect, test, type APIRequestContext } from "@playwright/test";

test.setTimeout(90_000);

interface OobCode {
  email?: string;
  oobCode?: string;
  requestType?: string;
}

const projectId = process.env.FIREBASE_TEST_PROJECT_ID ?? "demo-bleetary";

async function setEmulatorRole(
  email: string,
  role: "traveler" | "host" | "admin",
) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  const { getApps, initializeApp } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");
  const app =
    getApps().find((candidate) => candidate.name === "phase1-auth-tests") ??
    initializeApp({ projectId }, "phase1-auth-tests");
  const auth = getAuth(app);
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, {
    ...user.customClaims,
    role,
  });
}

async function findOobCode(
  request: APIRequestContext,
  email: string,
  requestType: string,
): Promise<string | null> {
  const response = await request.get(
    `http://127.0.0.1:9099/emulator/v1/projects/${projectId}/oobCodes`,
  );
  if (!response.ok()) return null;
  const payload = (await response.json()) as { oobCodes?: OobCode[] };
  return (
    payload.oobCodes
      ?.slice()
      .reverse()
      .find(
        (entry) =>
          entry.email === email && entry.requestType === requestType,
      )?.oobCode ?? null
  );
}

test("registration, verification, session protection, logout, and password reset", async ({
  page,
  request,
}) => {
  const email = `phase1-${Date.now()}@example.test`;
  const firstPassword = "Bleetary!Pass1";
  const secondPassword = "Bleetary!Pass2";

  await page.goto("/register");
  await page.getByLabel("Full name").fill("Phase One Traveler");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(firstPassword);
  await page.getByLabel("Confirm password").fill(firstPassword);
  await page.getByRole("button", { name: "Create traveler account" }).click();

  await expect(page).toHaveURL(/\/verify-email/, { timeout: 20_000 });
  await expect(
    page.getByRole("heading", { name: "Verify your email" }),
  ).toBeVisible();

  let verificationCode: string | null = null;
  await expect
    .poll(async () => {
      verificationCode = await findOobCode(
        request,
        email,
        "VERIFY_EMAIL",
      );
      return verificationCode;
    })
    .not.toBeNull();

  await page.goto(`/verify-email?oobCode=${verificationCode}`);
  await expect(
    page.getByText("Email verified. Continue to your account."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page).toHaveURL("/account", { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { name: "Welcome, Phase One Traveler" }),
  ).toBeVisible();

  await page.goto("/host/dashboard");
  await expect(page).toHaveURL("/unauthorized");
  await page.goto("/admin");
  await expect(page).toHaveURL("/unauthorized");

  await setEmulatorRole(email, "host");
  await page.goto("/host/dashboard");
  await expect(
    page.getByRole("heading", { name: "Welcome back, Phase 👋" }),
  ).toBeVisible();

  await setEmulatorRole(email, "admin");
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Core data foundation" }),
  ).toBeVisible();

  await setEmulatorRole(email, "traveler");
  await page.goto("/account");
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL("/login");
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login\?next=/);

  await page.goto("/forgot-password");
  await page.getByLabel("Account email").fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(
    page.getByText(
      "If that email belongs to an account, a reset link is on its way.",
    ),
  ).toBeVisible();

  let resetCode: string | null = null;
  await expect
    .poll(async () => {
      resetCode = await findOobCode(request, email, "PASSWORD_RESET");
      return resetCode;
    })
    .not.toBeNull();

  await page.goto(`/reset-password?oobCode=${resetCode}`);
  await page.getByLabel("New password", { exact: true }).fill(secondPassword);
  await page.getByLabel("Confirm new password").fill(secondPassword);
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(page.getByText("Password updated. You can now sign in.")).toBeVisible();

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(secondPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/account", { timeout: 15_000 });
});
