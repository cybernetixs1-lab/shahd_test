"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [name, setName] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function refreshTicket(ticketNumber) {
    setChecking(true);
    setError("");

    try {
      const response = await fetch(`/api/waitlist/${ticketNumber}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          localStorage.removeItem("waitlistTicketNumber");
          setTicket(null);
        }

        throw new Error(data.error || "Unable to check your ticket.");
      }

      setTicket(data);
    } catch (err) {
      setError(err.message || "Unable to check your ticket.");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    const savedTicket = localStorage.getItem("waitlistTicketNumber");

    if (savedTicket && /^\d+$/.test(savedTicket)) {
      refreshTicket(savedTicket);
    }
  }, []);

  async function handleJoin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          partySize: Number(partySize),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to join the waitlist.");
      }

      localStorage.setItem(
        "waitlistTicketNumber",
        String(data.ticketNumber)
      );

      setTicket(data);
      setName("");
      setNotice("You have successfully joined the waitlist.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function startNewEntry() {
    localStorage.removeItem("waitlistTicketNumber");
    setTicket(null);
    setError("");
    setNotice("");
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">WELCOME</p>
        <h1>Restaurant Waitlist</h1>
        <p className="muted">
          Join the queue and check your place while you wait.
        </p>
      </section>

      {error && <div className="alert error">{error}</div>}
      {notice && <div className="alert success">{notice}</div>}

      {ticket ? (
        <section className="panel ticket-panel">
          <p className="eyebrow">YOUR TICKET</p>
          <h2>Ticket #{ticket.ticketNumber}</h2>
          <p className="muted">
            {ticket.name} · Party of {ticket.partySize}
          </p>

          {ticket.status === "waiting" ? (
            <>
              <div className="position-number">
                {ticket.partiesAhead}
              </div>
              <p className="position-label">
                {ticket.partiesAhead === 1
                  ? "party ahead of you"
                  : "parties ahead of you"}
              </p>
              <p className="muted">
                Your position is based on waiting parties, not people.
              </p>
            </>
          ) : (
            <div className="alert">
              This ticket has been removed from the waiting list.
            </div>
          )}

          <div className="button-row">
            <button
              className="button primary"
              onClick={() => refreshTicket(ticket.ticketNumber)}
              disabled={checking}
            >
              {checking ? "Checking..." : "Refresh position"}
            </button>

            <button
              className="button secondary"
              onClick={startNewEntry}
            >
              Start new entry
            </button>
          </div>
        </section>
      ) : (
        <section className="panel">
          <h2>Join the waitlist</h2>
          <p className="muted">
            Enter your details to receive a ticket number.
          </p>

          <form onSubmit={handleJoin}>
            <label htmlFor="customer-name">Your name</label>
            <input
              id="customer-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              autoComplete="name"
              required
              placeholder="Enter your name"
            />

            <label htmlFor="party-size">Party size</label>
            <input
              id="party-size"
              type="number"
              value={partySize}
              onChange={(event) => setPartySize(event.target.value)}
              min="1"
              step="1"
              required
            />

            <button
              className="button primary full-width"
              type="submit"
              disabled={loading}
            >
              {loading ? "Joining..." : "Join waitlist"}
            </button>
          </form>
        </section>
      )}

      <footer className="footer">
        Restaurant Waitlist System
      </footer>
    </main>
  );
}
