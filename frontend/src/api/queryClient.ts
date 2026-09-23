import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // A response from the server is an answer, not a glitch: retrying a 404 or a
      // 401 only delays the error. Network failures are worth another attempt.
      retry: (failureCount, error) =>
        axios.isAxiosError(error) && error.response ? false : failureCount < 2,
    },
  },
});
