import { useCallback } from "react";
import { useSearchParams } from "react-router";

/**
 * Keeps list state (page, search, filters) in the query string, so a list
 * survives navigating to a detail page and back.
 */
export function useListParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const setParam = useCallback(
    (name: string, value: string) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (value) {
            next.set(name, value);
          } else {
            next.delete(name);
          }
          // Narrowing the result can leave the current page out of range.
          if (name !== "page") {
            next.delete("page");
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setPage = useCallback((value: number) => setParam("page", String(value)), [setParam]);

  return {
    page: Number(searchParams.get("page")) || 1,
    search: searchParams.get("search") ?? "",
    getParam: (name: string) => searchParams.get(name) ?? "",
    setParam,
    setPage,
  };
}
