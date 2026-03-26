import crypto from "crypto";

/**
 * Simple TRAC event generator
 * Simulates verifiable continuity between events
 */

function hash(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function createEvent(prevEvent, identity, decision) {
  const timestamp = new Date().toISOString();

  const base = {
    identity,
    decision,
    timestamp,
    prevHash: prevEvent ? prevEvent.hash : null
  };

  const hashInput = JSON.stringify(base);
  const eventHash = hash(hashInput);

  return {
    eventId: `EVT-${Date.now()}`,
    ...base,
    hash: eventHash
  };
}

// --- DEMO RUN ---

const event1 = createEvent(null, "IPR-0001", "ALLOW");
const event2 = createEvent(event1, "IPR-0001", "ALLOW");

console.log("Event 1:", event1);
console.log("Event 2:", event2);
