import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { fetchCurrentUser, login } from "../api/auth";
import type { Credentials, CurrentUser } from "../api/auth";
import { clearTokens, hasTokens, setTokens, subscribeToTokens } from "../api/tokens";

type AuthContextValue = {
  user: CurrentUser | null;
  isLoading: boolean;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(hasTokens());

  // Tokens outlive a page reload, the user object does not.
  useEffect(() => {
    if (!hasTokens()) {
      return;
    }
    fetchCurrentUser()
      .then(setUser)
      .catch(clearTokens)
      .finally(() => setIsLoading(false));
  }, []);

  // A refresh that fails inside the interceptor drops the tokens without asking.
  useEffect(
    () =>
      subscribeToTokens(() => {
        if (!hasTokens()) {
          setUser(null);
        }
      }),
    [],
  );

  const signIn = useCallback(async (credentials: Credentials) => {
    setTokens(await login(credentials));
    setUser(await fetchCurrentUser());
  }, []);

  const signOut = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signIn, signOut }),
    [user, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
