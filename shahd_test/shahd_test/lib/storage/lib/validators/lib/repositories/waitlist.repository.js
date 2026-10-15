import {
  readWaitlist,
  updateWaitlist,
} from "@/lib/storage/waitlist.storage";

export function createEntry({ name, partySize }) {
  return updateWaitlist((data) => {
    const now = new Date().toISOString();
    const ticketNumber = data.nextTicketNumber;

    const entry = {
      id: crypto.randomUUID(),
      ticketNumber,
      name,
      partySize,
      status: "waiting",
      createdAt: now,
      removedAt: null,
    };

    data.entries.push(entry);
    data.nextTicketNumber += 1;

    const partiesAhead = data.entries.filter(
      (other) =>
        other.status === "waiting" &&
        other.ticketNumber < ticketNumber
    ).length;

    return { entry, partiesAhead };
  });
}

export function findEntry(ticketNumber) {
  return readWaitlist((data) => {
    return data.entries.find(
      (entry) => entry.ticketNumber === ticketNumber
    ) ?? null;
  });
}

export function listWaitingEntries() {
  return readWaitlist((data) => {
    return data.entries
      .filter((entry) => entry.status === "waiting")
      .sort((a, b) => a.ticketNumber - b.ticketNumber);
  });
}

export function getEntryWithPosition(ticketNumber) {
  return readWaitlist((data) => {
    const entry = data.entries.find(
      (item) => item.ticketNumber === ticketNumber
    );

    if (!entry) {
      return null;
    }

    const partiesAhead =
      entry.status === "waiting"
        ? data.entries.filter(
            (other) =>
              other.status === "waiting" &&
              other.ticketNumber < ticketNumber
          ).length
        : null;

    return { entry, partiesAhead };
  });
}

export function removeEntry(ticketNumber) {
  return updateWaitlist((data) => {
    const entry = data.entries.find(
      (item) => item.ticketNumber === ticketNumber
    );

    if (!entry) {
      return { outcome: "not_found" };
    }

    if (entry.status === "removed") {
      return { outcome: "already_removed" };
    }

    entry.status = "removed";
    entry.removedAt = new Date().toISOString();

    return { outcome: "removed", entry };
  });
}
