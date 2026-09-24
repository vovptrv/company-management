import axios from "axios";

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "./tokens";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    /** Guards against a refresh loop: every request gets at most one retry. */
    retriedAfterRefresh?: boolean;
  }
}

// Relative base URL: the dev server and nginx both serve the API from the same origin.
const BASE_URL = "/api";

export const apiClient = axios.create({ baseURL: BASE_URL });

/** Sent with every list request, so the page size does not depend on a backend default. */
export const PAGE_SIZE = 10;

let refreshRequest: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshRequest) {
    refreshRequest = requestAccessToken().finally(() => {
      refreshRequest = null;
    });
  }
  return refreshRequest;
}

async function requestAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error("No refresh token stored.");
  }

  // Plain axios, not apiClient: a failing refresh must not trigger another refresh.
  const { data } = await axios.post<{ access: string }>(`${BASE_URL}/auth/token/refresh/`, {
    refresh,
  });
  setAccessToken(data.access);
  return data.access;
}

apiClient.interceptors.request.use((config) => {
  const access = getAccessToken();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

apiClient.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401) {
    throw error;
  }

  const request = error.config;
  // A 401 on the login request itself means wrong credentials, not a stale token.
  if (!request || request.retriedAfterRefresh || request.url?.startsWith("/auth/token")) {
    throw error;
  }

  request.retriedAfterRefresh = true;
  try {
    await refreshAccessToken();
  } catch {
    clearTokens();
    throw error;
  }
  return apiClient(request);
});
