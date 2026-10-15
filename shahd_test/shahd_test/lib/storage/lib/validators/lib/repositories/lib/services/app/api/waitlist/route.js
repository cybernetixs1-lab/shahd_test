import {
  joinWaitlist,
  WaitlistError,
} from "@/lib/services/waitlist.service";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Request body must contain valid JSON." },
        { status: 400 }
      );
    }

    const ticket = await joinWaitlist(body);

    return Response.json(ticket, { status: 201 });
  } catch (error) {
    if (error instanceof WaitlistError) {
      return Response.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Failed to join waitlist.");

    return Response.json(
      { error: "Unable to save your waitlist entry. Please try again." },
      { status: 500 }
    );
  }
}
