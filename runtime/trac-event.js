import crypto from "node:crypto";

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function stableStringify(payload) {
  return JSON.stringify(
    Object.keys(payload)
      .sort()
      .reduce((accumulator, key) => {
        accumulator[key] = payload[key];
        return accumulator;
      }, {})
  );
}

function buildEventId(index) {
  return `EVT-${String(index).padStart(4, "0")}`;
}

function createTracEvent({ index, prevEvent = null, identity, intent, decision }) {
  const timestamp = new Date().toISOString();

  const payload = {
    eventId: buildEventId(index),
    timestamp,
    identity,
    intent,
    decision,
    prevHash: prevEvent ? prevEvent.hash : null
  };

  const hash = sha256(stableStringify(payload));

  return {
    ...payload,
    hash
  };
}

function verifyChain(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return {
      ok: false,
      reason: "empty chain"
    };
  }

  for (let index = 0; index < events.length; index += 1) {
    const currentEvent = events[index];

    const recalculatedHash = sha256(
      stableStringify({
        eventId: currentEvent.eventId,
        timestamp: currentEvent.timestamp,
        identity: currentEvent.identity,
        intent: currentEvent.intent,
        decision: currentEvent.decision,
        prevHash: currentEvent.prevHash
      })
    );

    if (recalculatedHash !== currentEvent.hash) {
      return {
        ok: false,
        reason: `hash mismatch at ${currentEvent.eventId}`
      };
    }

    if (index === 0 && currentEvent.prevHash !== null) {
      return {
        ok: false,
        reason: `first event must have prevHash = null`
      };
    }

    if (index > 0) {
      const previousEvent = events[index - 1];

      if (currentEvent.prevHash !== previousEvent.hash) {
        return {
          ok: false,
          reason: `broken continuity between ${previousEvent.eventId} and ${currentEvent.eventId}`
        };
      }
    }
  }

  return {
    ok: true,
    reason: "continuity verified"
  };
}

const event1 = createTracEvent({
  index: 1,
  identity: "IPR-0001",
  intent: "pilot.initialization",
  decision: "ALLOW"
});

const event2 = createTracEvent({
  index: 2,
  prevEvent: event1,
  identity: "IPR-0001",
  intent: "pilot.execution",
  decision: "ALLOW"
});

const chain = [event1, event2];
const verification = verifyChain(chain);

console.log(JSON.stringify({ chain, verification }, null, 2));
