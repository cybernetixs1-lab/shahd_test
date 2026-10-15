export function validateJoinInput(body) {
  const errors = {};

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      valid: false,
      errors: { body: "A valid JSON object is required." },
    };
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    errors.name = "Name is required.";
  } else if (body.name.trim().length > 100) {
    errors.name = "Name must be 100 characters or fewer.";
  }

  if (
    body.partySize === undefined ||
    !Number.isInteger(body.partySize) ||
    body.partySize <= 0
  ) {
    errors.partySize = "Party size must be a positive whole number.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value: {
      name: typeof body.name === "string" ? body.name.trim() : "",
      partySize: body.partySize,
    },
  };
}

export function validateTicketNumber(value) {
  const ticketNumber = Number(value);

  if (
    typeof value !== "string" ||
    !/^\d+$/.test(value) ||
    !Number.isSafeInteger(ticketNumber) ||
    ticketNumber < 1
  ) {
    return null;
  }

  return ticketNumber;
}
