import type { TokenPair } from "./auth";

const ACCESS_TOKEN_KEY = "cm.access";
const REFRESH_TOKEN_KEY = "cm.refresh";

type Listener = () => void;

const listeners = new Set<Listener>();

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function hasTokens(): boolean {
  return getRefreshToken() !== null;
}

export function setTokens(tokens: TokenPair): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  notify();
}

export function setAccessToken(access: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  notify();
}

/** Lets the auth context react when a failed refresh drops the session. */
export function subscribeToTokens(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}
