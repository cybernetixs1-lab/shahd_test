import {
  getCustomerTicket,
  WaitlistError,
} from "@/lib/services/waitlist.service";

import { validateTicketNumber } from "@/lib/validators/waitlist.validator";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    const { ticketNumber: rawTicketNumber } = await params;
    const ticketNumber = validateTicketNumber(rawTicketNumber);

    if (!ticketNumber) {
      return Response.json(
        { error: "Invalid ticket number." },
        { status: 400 }
      );
    }

    const ticket = await getCustomerTicket(ticketNumber);

    return Response.json(ticket);
  } catch (error) {
    if (error instanceof WaitlistError) {
      return Response.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Failed to retrieve waitlist ticket.");

    return Response.json(
      { error: "Unable to retrieve your ticket." },
      { status: 500 }
    );
  }
}
