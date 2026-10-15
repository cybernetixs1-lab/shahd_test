"use client";

import { useCallback, useEffect, useState } from "react";

export default function StaffPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadEntries = useCallback(async () => {
    setError("");

    try {
      const response = await fetch("/api/staff/waitlist", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load the waiting list.");
      }

      setEntries(data.entries);
    } catch (err) {
      setError(err.message || "Unable to load the waiting list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  async function handleRemove(ticketNumber) {
    const confirmed = window.confirm(
      `Remove ticket #${ticketNumber} from the waiting list?`
    );

    if (!confirmed) return;

    setRemoving(ticketNumber);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/staff/waitlist/${ticketNumber}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to remove this party.");
      }

      setNotice(`Ticket #${ticketNumber} was removed.`);
      await loadEntries();
    } catch (err) {
      setError(err.message || "Unable to remove this party.");
    } finally {
      setRemoving(null);
    }
  }

  return (
    <main className="page-shell staff-shell">
      <section className="hero">
        <p className="eyebrow">STAFF DASHBOARD</p>
        <h1>Waiting list</h1>
        <p className="muted">
          Manage waiting parties in the order they joined.
        </p>
      </section>

      {error && <div className="alert error">{error}</div>}
      {notice && <div className="alert success">{notice}</div>}

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Current parties</h2>
            <p className="muted">
              {entries.length}{" "}
              {entries.length === 1 ? "party" : "parties"} waiting
            </p>
          </div>

          <button
            className="button secondary"
            onClick={loadEntries}
            disabled={loading}
          >
            Refresh list
          </button>
        </div>

        {loading ? (
          <p className="muted">Loading waitlist...</p>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <h3>No parties waiting</h3>
            <p className="muted">
              New customer entries will appear here.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Name</th>
                  <th>Party size</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.ticketNumber}>
                    <td>
                      <strong>#{entry.ticketNumber}</strong>
                    </td>
                    <td>{entry.name}</td>
                    <td>{entry.partySize}</td>
                    <td>
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <button
                        className="button danger"
                        onClick={() => handleRemove(entry.ticketNumber)}
                        disabled={removing !== null}
                      >
                        {removing === entry.ticketNumber
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="footer">
        <a href="/">Customer page</a>
      </footer>
    </main>
  );
}
