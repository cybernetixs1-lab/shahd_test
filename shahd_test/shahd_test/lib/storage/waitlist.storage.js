import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIRECTORY, "waitlist.txt");

let operationQueue = Promise.resolve();

function withLock(operation) {
  const result = operationQueue.then(operation, operation);

  operationQueue = result.then(
    () => undefined,
    () => undefined
  );

  return result;
}

function createEmptyData() {
  return {
    nextTicketNumber: 1001,
    entries: [],
  };
}

function validateDocument(data) {
  if (
    !data ||
    typeof data !== "object" ||
    !Number.isSafeInteger(data.nextTicketNumber) ||
    data.nextTicketNumber < 1 ||
    !Array.isArray(data.entries)
  ) {
    throw new Error("Waitlist storage contains an invalid data structure.");
  }

  const tickets = new Set();
  let maxTicketNumber = 0;

  for (const entry of data.entries) {
    if (
      !entry ||
      typeof entry.id !== "string" ||
      !Number.isSafeInteger(entry.ticketNumber) ||
      entry.ticketNumber < 1 ||
      typeof entry.name !== "string" ||
      !Number.isInteger(entry.partySize) ||
      entry.partySize < 1 ||
      !["waiting", "removed"].includes(entry.status) ||
      typeof entry.createdAt !== "string" ||
      Number.isNaN(Date.parse(entry.createdAt)) ||
      !(
        entry.removedAt === null ||
        (typeof entry.removedAt === "string" &&
          !Number.isNaN(Date.parse(entry.removedAt)))
      )
    ) {
      throw new Error("Waitlist storage contains an invalid entry.");
    }

    if (tickets.has(entry.ticketNumber)) {
      throw new Error("Waitlist storage contains duplicate ticket numbers.");
    }

    if (entry.status === "waiting" && entry.removedAt !== null) {
      throw new Error("Waitlist storage contains an inconsistent waiting entry.");
    }

    if (entry.status === "removed" && entry.removedAt === null) {
      throw new Error("Waitlist storage contains an inconsistent removed entry.");
    }

    tickets.add(entry.ticketNumber);
    maxTicketNumber = Math.max(maxTicketNumber, entry.ticketNumber);
  }

  if (data.nextTicketNumber <= maxTicketNumber) {
    throw new Error("Waitlist ticket counter is invalid.");
  }

  return data;
}

async function writeAtomically(data) {
  await mkdir(DATA_DIRECTORY, { recursive: true });

  const temporaryFile = path.join(
    DATA_DIRECTORY,
    `.waitlist-${randomUUID()}.tmp`
  );

  try {
    await writeFile(
      temporaryFile,
      JSON.stringify(data, null, 2) + "\n",
      "utf8"
    );

    await rename(temporaryFile, DATA_FILE);
  } catch (error) {
    await rm(temporaryFile, { force: true }).catch(() => {});
    throw error;
  }
}

async function readDocument() {
  await mkdir(DATA_DIRECTORY, { recursive: true });

  let contents;

  try {
    contents = await readFile(DATA_FILE, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    const initialData = createEmptyData();
    await writeAtomically(initialData);
    return initialData;
  }

  let parsed;

  try {
    parsed = JSON.parse(contents);
  } catch {
    throw new Error(
      "Waitlist storage contains invalid JSON. Back up and repair data/waitlist.txt."
    );
  }

  return validateDocument(parsed);
}

export function readWaitlist(readOperation) {
  return withLock(async () => {
    const data = await readDocument();
    return readOperation(data);
  });
}

export function updateWaitlist(updateOperation) {
  return withLock(async () => {
    const data = await readDocument();
    const result = await updateOperation(data);

    await writeAtomically(data);

    return result;
  });
}
