/**
 * Structured JSON logger for monitoring-worthy events.
 *
 * Outputs one JSON object per line to stderr — compatible with
 * Datadog, CloudWatch, and other log aggregators.
 */

export interface StructuredLogEntry {
  level: "info" | "warn" | "error";
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

/** Write a structured JSON log entry to stderr. */
export function logStructured(entry: StructuredLogEntry): void {
  process.stderr.write(JSON.stringify(entry) + "\n");
}
