function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidStatus(status) {
  return ["active", "suspended", "revoked"].includes(status);
}

function isValidType(type) {
  return ["human", "ai", "system", "node"].includes(type);
}

function isValidCapabilities(capabilities) {
  return Array.isArray(capabilities) && capabilities.every(isNonEmptyString);
}

function validateIpr(ipr) {
  if (!ipr || typeof ipr !== "object") {
    return {
      ok: false,
      reason: "IPR must be an object"
    };
  }

  if (!isNonEmptyString(ipr.id)) {
    return {
      ok: false,
      reason: "Missing or invalid IPR id"
    };
  }

  if (!isValidType(ipr.type)) {
    return {
      ok: false,
      reason: "Invalid IPR type"
    };
  }

  if (!isNonEmptyString(ipr.role)) {
    return {
      ok: false,
      reason: "Missing or invalid IPR role"
    };
  }

  if (!isValidCapabilities(ipr.capabilities)) {
    return {
      ok: false,
      reason: "Invalid IPR capabilities"
    };
  }

  if (!isValidStatus(ipr.status)) {
    return {
      ok: false,
      reason: "Invalid IPR status"
    };
  }

  if (ipr.status !== "active") {
    return {
      ok: false,
      reason: `IPR is not active: ${ipr.status}`
    };
  }

  return {
    ok: true,
    reason: "IPR valid"
  };
}

const demoIpr = {
  id: "IPR-0001",
  type: "human",
  role: "operator",
  capabilities: ["pilot.initialization", "pilot.execution"],
  status: "active"
};

console.log(JSON.stringify(validateIpr(demoIpr), null, 2));

export { validateIpr };
