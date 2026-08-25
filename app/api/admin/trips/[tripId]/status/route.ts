import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeRequest, isSameOrigin } from "@/lib/auth/request";
import { updateTripPublicationStatus } from "@/lib/db/admin";

const tripStatusSchema = z.object({
  status: z.enum(["draft", "published", "archived"]),
  reason: z.string().trim().max(500).optional().default(""),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ tripId: string }> },
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  const auth = await authorizeRequest(request, ["admin"]);
  if (!auth.session) {
    return NextResponse.json(
      { error: auth.error || "Administrator privileges required." },
      { status: auth.status || 403 },
    );
  }

  const { tripId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = tripStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Valid status ('draft', 'published', 'archived') is required." },
      { status: 400 },
    );
  }

  try {
    await updateTripPublicationStatus(
      auth.session.uid,
      tripId,
      parsed.data.status,
      parsed.data.reason,
    );

    return NextResponse.json({
      success: true,
      tripId,
      status: parsed.data.status,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Failed to update trip status.";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
