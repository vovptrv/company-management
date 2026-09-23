import { apiClient } from "./client";

/** The backend authenticates by email: `User.USERNAME_FIELD` is `email`. */
export type Credentials = {
  email: string;
  password: string;
};

export type TokenPair = {
  access: string;
  refresh: string;
};

export type CurrentUser = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
};

export async function login(credentials: Credentials): Promise<TokenPair> {
  const { data } = await apiClient.post<TokenPair>("/auth/token/", credentials);
  return data;
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const { data } = await apiClient.get<CurrentUser>("/auth/me/");
  return data;
}
