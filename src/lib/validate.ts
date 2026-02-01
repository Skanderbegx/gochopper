/**
 * Input validation and sanitization helpers for API endpoints.
 */

/** Strip HTML tags to prevent XSS in stored content */
export function sanitize(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Validate a string field: non-empty, within length limits */
export function validateString(
  value: unknown,
  fieldName: string,
  opts: { min?: number; max?: number } = {}
): { valid: true; value: string } | { valid: false; error: string } {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required and must be a non-empty string` };
  }
  const trimmed = value.trim();
  const min = opts.min ?? 1;
  const max = opts.max ?? 10000;
  if (trimmed.length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters` };
  }
  if (trimmed.length > max) {
    return { valid: false, error: `${fieldName} must be at most ${max} characters` };
  }
  return { valid: true, value: sanitize(trimmed) };
}

/** Validate that a value is one of the allowed enum values */
export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowed: readonly T[]
): { valid: true; value: T } | { valid: false; error: string } {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${allowed.join(", ")}`,
    };
  }
  return { valid: true, value: value as T };
}

/** Validate a number field within a range */
export function validateNumber(
  value: unknown,
  fieldName: string,
  opts: { min?: number; max?: number } = {}
): { valid: true; value: number } | { valid: false; error: string } {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (typeof num !== "number" || isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }
  if (opts.min !== undefined && num < opts.min) {
    return { valid: false, error: `${fieldName} must be at least ${opts.min}` };
  }
  if (opts.max !== undefined && num > opts.max) {
    return { valid: false, error: `${fieldName} must be at most ${opts.max}` };
  }
  return { valid: true, value: num };
}

/** Validate an array of strings (e.g. tags, capabilities) */
export function validateStringArray(
  value: unknown,
  fieldName: string,
  opts: { maxItems?: number; maxItemLength?: number } = {}
): { valid: true; value: string[] } | { valid: false; error: string } {
  if (!Array.isArray(value)) {
    return { valid: false, error: `${fieldName} must be an array` };
  }
  const maxItems = opts.maxItems ?? 20;
  const maxItemLength = opts.maxItemLength ?? 100;
  if (value.length > maxItems) {
    return { valid: false, error: `${fieldName} can have at most ${maxItems} items` };
  }
  const sanitized: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      return { valid: false, error: `Each item in ${fieldName} must be a string` };
    }
    if (item.length > maxItemLength) {
      return { valid: false, error: `Each item in ${fieldName} must be at most ${maxItemLength} characters` };
    }
    sanitized.push(sanitize(item.trim()));
  }
  return { valid: true, value: sanitized };
}
