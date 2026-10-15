import {
  createEntry,
  getEntryWithPosition,
  listWaitingEntries,
  removeEntry,
} from "@/lib/repositories/waitlist.repository";

import { validateJoinInput } from "@/lib/validators/waitlist.validator";

export class WaitlistError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "WaitlistError";
    this.status = status;
  }
}

export async function joinWaitlist(body) {
  const validation = validateJoinInput(body);

  if (!validation.valid) {
    throw new WaitlistError(
      Object.values(validation.errors).join(" "),
      400
    );
  }

  const { entry, partiesAhead } = await createEntry(validation.value);

  return {
    ticketNumber: entry.ticketNumber,
    name: entry.name,
    partySize: entry.partySize,
    status: entry.status,
    createdAt: entry.createdAt,
    partiesAhead,
  };
}

export async function getCustomerTicket(ticketNumber) {
  const result = await getEntryWithPosition(ticketNumber);

  if (!result) {
    throw new WaitlistError("Ticket not found.", 404);
  }

  const { entry, partiesAhead } = result;

  return {
    ticketNumber: entry.ticketNumber,
    name: entry.name,
    partySize: entry.partySize,
    status: entry.status,
    createdAt: entry.createdAt,
    removedAt: entry.removedAt,
    partiesAhead,
  };
}

export async function getStaffWaitlist() {
  const entries = await listWaitingEntries();

  return entries.map((entry, index) => ({
    ticketNumber: entry.ticketNumber,
    name: entry.name,
    partySize: entry.partySize,
    createdAt: entry.createdAt,
    partiesAhead: index,
  }));
}

export async function removeWaitlistEntry(ticketNumber) {
  const result = await removeEntry(ticketNumber);

  if (result.outcome === "not_found") {
    throw new WaitlistError("Ticket not found.", 404);
  }

  if (result.outcome === "already_removed") {
    throw new WaitlistError("This ticket has already been removed.", 409);
  }

  return {
    message: "Party removed successfully.",
    ticketNumber: result.entry.ticketNumber,
  };
}
