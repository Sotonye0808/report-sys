type LogLevel = "info" | "warn" | "error";

const SENSITIVE_FIELD_PATTERN = /(password|token|secret|authorization|cookie|api[-_]?key|reseturl|joinurl)/i;

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }

  if (value && typeof value === "object") {
    const redacted: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      redacted[key] = SENSITIVE_FIELD_PATTERN.test(key) ? "[REDACTED]" : redactValue(val);
    }
    return redacted;
  }

  return value;
}

function write(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
  const safeMetadata = metadata ? redactValue(metadata) : undefined;
  const payload = safeMetadata ? { message, ...safeMetadata } : { message };

  if (level === "error") {
    console.error(payload);
    return;
  }

  if (level === "warn") {
    console.warn(payload);
    return;
  }

  console.info(payload);
}

export function logServerInfo(message: string, metadata?: Record<string, unknown>) {
  write("info", message, metadata);
}

export function logServerWarn(message: string, metadata?: Record<string, unknown>) {
  write("warn", message, metadata);
}

export function logServerError(message: string, metadata?: Record<string, unknown>) {
  write("error", message, metadata);
}

