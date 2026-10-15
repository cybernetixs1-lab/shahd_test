import {
  removeWaitlistEntry,
  WaitlistError,
} from "@/lib/services/waitlist.service";

import { validateTicketNumber } from "@/lib/validators/waitlist.validator";

export const runtime = "nodejs";

export async function DELETE(_request, { params }) {
  try {
    const { ticketNumber: rawTicketNumber } = await params;
    const ticketNumber = validateTicketNumber(rawTicketNumber);

    if (!ticketNumber) {
      return Response.json(
        { error: "Invalid ticket number." },
        { status: 400 }
      );
    }

    const result = await removeWaitlistEntry(ticketNumber);

    return Response.json(result);
  } catch (error) {
    if (error instanceof WaitlistError) {
      return Response.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Failed to remove waitlist entry.");

    return Response.json(
      { error: "Unable to remove this party." },
      { status: 500 }
    );
  }
}
