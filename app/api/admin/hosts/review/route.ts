import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeRequest, isSameOrigin } from "@/lib/auth/request";
import { reviewHostApplication } from "@/lib/db/admin";

const hostReviewSchema = z.object({
  applicationId: z.string().trim().min(1, "Application ID is required"),
  decision: z.enum(["approved", "rejected", "waitlisted", "under_review"], {
    message: "Invalid review decision.",
  }),
  reviewNotes: z.string().trim().max(1000).optional().default(""),
});

export async function POST(request: NextRequest) {
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

  const body = await request.json().catch(() => null);
  const parsed = hostReviewSchema.safeParse(body);

  if (!parsed.success) {
    const errorMsg =
      parsed.error.issues[0]?.message || "Invalid review parameters.";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const { applicationId, decision, reviewNotes } = parsed.data;

  try {
    await reviewHostApplication(
      auth.session.uid,
      applicationId,
      decision,
      reviewNotes,
    );

    return NextResponse.json({
      success: true,
      applicationId,
      decision,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Failed to review host application.";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
