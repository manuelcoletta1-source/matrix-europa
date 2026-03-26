import { validateIpr } from "./ipr-check.js";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeIntent(intent) {
  return isNonEmptyString(intent) ? intent.trim() : "";
}

function evaluateDecision({ ipr, intent }) {
  const iprValidation = validateIpr(ipr);

  if (!iprValidation.ok) {
    return {
      decision: "BLOCK",
      reason: `identity validation failed: ${iprValidation.reason}`
    };
  }

  const normalizedIntent = normalizeIntent(intent);

  if (!normalizedIntent) {
    return {
      decision: "BLOCK",
      reason: "missing or invalid intent"
    };
  }

  const allowed = Array.isArray(ipr.capabilities) && ipr.capabilities.includes(normalizedIntent);

  if (!allowed) {
    return {
      decision: "BLOCK",
      reason: `intent not allowed for ${ipr.id}: ${normalizedIntent}`
    };
  }

  return {
    decision: "ALLOW",
    reason: `intent allowed for ${ipr.id}: ${normalizedIntent}`
  };
}

const demoIpr = {
  id: "IPR-0001",
  type: "human",
  role: "operator",
  capabilities: ["pilot.initialization", "pilot.execution"],
  status: "active"
};

console.log(
  JSON.stringify(
    {
      allowedExample: evaluateDecision({
        ipr: demoIpr,
        intent: "pilot.initialization"
      }),
      blockedExample: evaluateDecision({
        ipr: demoIpr,
        intent: "pilot.shutdown"
      })
    },
    null,
    2
  )
);

export { evaluateDecision };
