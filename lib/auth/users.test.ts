import { describe, expect, it, vi } from "vitest";
import { ensureUserDocument } from "@/lib/auth/users";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

vi.mock("@/lib/firebase-admin", () => ({
  getAdminAuth: vi.fn(),
  getAdminDb: vi.fn(),
}));

describe("ensureUserDocument", () => {
  it("assigns traveler role by default if no role claim exists", async () => {
    const setCustomUserClaims = vi.fn().mockResolvedValue(undefined);
    const updateUser = vi.fn();
    const docSet = vi.fn().mockResolvedValue(undefined);
    const docGet = vi.fn().mockResolvedValue({ data: () => null });

    const mockAuth = {
      getUser: vi.fn().mockResolvedValue({
        uid: "user-abc",
        email: "newuser@example.com",
        displayName: null,
        emailVerified: true,
        disabled: false,
        customClaims: {},
      }),
      setCustomUserClaims,
      updateUser,
    };

    const mockDb = {
      collection: vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: docGet,
          set: docSet,
        }),
      }),
    };

    vi.mocked(getAdminAuth).mockReturnValue(mockAuth as unknown as ReturnType<typeof getAdminAuth>);
    vi.mocked(getAdminDb).mockReturnValue(mockDb as unknown as ReturnType<typeof getAdminDb>);

    const role = await ensureUserDocument({
      uid: "user-abc",
      email: "newuser@example.com",
      aud: "demo-project",
      auth_time: 123456,
      exp: 123456 + 3600,
      firebase: { identities: {}, sign_in_provider: "password" },
      iss: "https://securetoken.google.com/demo-project",
      sub: "user-abc",
      iat: 123456,
    });

    expect(role).toBe("traveler");
    expect(setCustomUserClaims).toHaveBeenCalledWith("user-abc", { role: "traveler" });
    expect(docSet).toHaveBeenCalled();
  });
});
