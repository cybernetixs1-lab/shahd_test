import { getStaffWaitlist } from "@/lib/services/waitlist.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const entries = await getStaffWaitlist();

    return Response.json({ entries });
  } catch (error) {
    console.error("Failed to retrieve staff waitlist.");

    return Response.json(
      { error: "Unable to load the waiting list." },
      { status: 500 }
    );
  }
}
