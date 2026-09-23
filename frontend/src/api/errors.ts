import axios from "axios";

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
