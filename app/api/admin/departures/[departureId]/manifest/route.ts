import { NextRequest, NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth/request";
import { getDepartureManifest } from "@/lib/db/admin";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ departureId: string }> },
) {
  const auth = await authorizeRequest(request, ["admin"]);
  if (!auth.session) {
    return NextResponse.json(
      { error: auth.error || "Administrator privileges required." },
      { status: auth.status || 403 },
    );
  }

  const { departureId } = await context.params;
  const manifest = await getDepartureManifest(departureId);

  if (!manifest) {
    return NextResponse.json(
      { error: "Departure not found or invalid." },
      { status: 404 },
    );
  }

  return NextResponse.json(manifest);
}
