import axios from "axios";

export const NON_FIELD_ERROR = "non_field_errors";

export type FieldErrors = Record<string, string>;

export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "Unexpected error.";
  }
  if (!error.response) {
    return "Cannot reach the server.";
  }

  const messages = Object.values(getResponseErrors(error)).map(toMessage).filter(Boolean);
  return messages.length > 0
    ? messages.join(" ")
    : `Request failed with status ${error.response.status}.`;
}

/**
 * Splits a DRF `{field: [message]}` response into one message per field.
 * Anything the form has no input for lands under `NON_FIELD_ERROR`.
 */
export function getFieldErrors(error: unknown, fields: readonly string[]): FieldErrors {
  const errors: FieldErrors = {};
  const general: string[] = [];

  for (const [key, value] of Object.entries(getResponseErrors(error))) {
    const message = toMessage(value);
    if (!message) {
      continue;
    }
    if (fields.includes(key)) {
      errors[key] = message;
    } else {
      general.push(message);
    }
  }

  if (general.length > 0) {
    errors[NON_FIELD_ERROR] = general.join(" ");
  }
  if (Object.keys(errors).length === 0) {
    errors[NON_FIELD_ERROR] = getErrorMessage(error);
  }
  return errors;
}

function getResponseErrors(error: unknown): Record<string, unknown> {
  const data = axios.isAxiosError(error) ? error.response?.data : undefined;
  return data && typeof data === "object" ? data : {};
}

function toMessage(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string").join(" ");
  }
  return "";
}
