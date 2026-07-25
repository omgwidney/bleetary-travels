export const USER_ROLES = ["traveler", "host", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function roleHome(role: UserRole): string {
  if (role === "admin") return "/admin";
  if (role === "host") return "/host/dashboard";
  return "/account";
}
