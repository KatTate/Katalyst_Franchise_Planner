import { describe, it, expect, vi, afterEach } from "vitest";
import { logStructured, type StructuredLogEntry } from "./structured-logger";

describe("logStructured", () => {
  const originalWrite = process.stderr.write;

  afterEach(() => {
    process.stderr.write = originalWrite;
  });

  it("writes a JSON line to stderr", () => {
    const captured: string[] = [];
    process.stderr.write = vi.fn((chunk: any) => {
      captured.push(chunk);
      return true;
    }) as any;

    const entry: StructuredLogEntry = {
      level: "info",
      event: "test_event",
      timestamp: "2025-01-01T00:00:00Z",
      data: { key: "value" },
    };

    logStructured(entry);

    expect(captured).toHaveLength(1);
    const parsed = JSON.parse(captured[0].trimEnd());
    expect(parsed.level).toBe("info");
    expect(parsed.event).toBe("test_event");
    expect(parsed.timestamp).toBe("2025-01-01T00:00:00Z");
    expect(parsed.data.key).toBe("value");
  });

  it("terminates each entry with a newline", () => {
    const captured: string[] = [];
    process.stderr.write = vi.fn((chunk: any) => {
      captured.push(chunk);
      return true;
    }) as any;

    logStructured({
      level: "warn",
      event: "warning_event",
      timestamp: "2025-06-15T12:00:00Z",
      data: {},
    });

    expect(captured[0].endsWith("\n")).toBe(true);
  });

  it("handles error level entries", () => {
    const captured: string[] = [];
    process.stderr.write = vi.fn((chunk: any) => {
      captured.push(chunk);
      return true;
    }) as any;

    logStructured({
      level: "error",
      event: "critical_failure",
      timestamp: "2025-03-01T08:30:00Z",
      data: { errorCode: 500, message: "Internal error" },
    });

    const parsed = JSON.parse(captured[0].trimEnd());
    expect(parsed.level).toBe("error");
    expect(parsed.data.errorCode).toBe(500);
  });

  it("handles complex nested data", () => {
    const captured: string[] = [];
    process.stderr.write = vi.fn((chunk: any) => {
      captured.push(chunk);
      return true;
    }) as any;

    logStructured({
      level: "info",
      event: "nested_data",
      timestamp: "2025-01-01T00:00:00Z",
      data: {
        user: { id: "u1", email: "test@test.com" },
        metrics: [1, 2, 3],
        nested: { deep: { value: true } },
      },
    });

    const parsed = JSON.parse(captured[0].trimEnd());
    expect(parsed.data.user.id).toBe("u1");
    expect(parsed.data.metrics).toEqual([1, 2, 3]);
    expect(parsed.data.nested.deep.value).toBe(true);
  });
});
