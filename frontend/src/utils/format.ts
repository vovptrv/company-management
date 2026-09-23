export const EMPTY_VALUE = "—";

/**
 * Formats an ISO date (`YYYY-MM-DD`) without going through `Date`, which would
 * read the value as UTC midnight and shift it a day back in western timezones.
 */
export function formatDate(value: string | null): string {
  if (!value) {
    return EMPTY_VALUE;
  }
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

export function fullName(person: { first_name: string; last_name: string }): string {
  return `${person.first_name} ${person.last_name}`;
}
