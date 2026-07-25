import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeRequest, isSameOrigin } from "@/lib/auth/request";
import { USER_ROLES } from "@/lib/auth/roles";
import { setUserRole } from "@/lib/auth/users";

const roleSchema = z.object({
  role: z.enum(USER_ROLES),
  reason: z.string().trim().min(5).max(500),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ uid: string }> },
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const auth = await authorizeRequest(request, ["admin"]);
  if (!auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const parsed = roleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "A valid role and reason are required." },
      { status: 400 },
    );
  }

  const { uid } = await context.params;
  if (uid === auth.session.uid && parsed.data.role !== "admin") {
    return NextResponse.json(
      { error: "Administrators cannot remove their own admin role." },
      { status: 409 },
    );
  }

  try {
    await setUserRole(
      auth.session.uid,
      uid,
      parsed.data.role,
      parsed.data.reason,
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to update this user's role." },
      { status: 400 },
    );
  }
}
