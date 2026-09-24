import { useCallback, useState } from "react";

/**
 * The two dialogs a page needs to manage records: a form that both creates and
 * edits, and a delete confirmation. Both are closed when their state is null.
 */
export function useCrudDialogs<T>() {
  const [form, setForm] = useState<{ entity: T | null } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);

  return {
    form,
    openCreate: useCallback(() => setForm({ entity: null }), []),
    openEdit: useCallback((entity: T) => setForm({ entity }), []),
    closeForm: useCallback(() => setForm(null), []),
    pendingDelete,
    askDelete: useCallback((entity: T) => setPendingDelete(entity), []),
    cancelDelete: useCallback(() => setPendingDelete(null), []),
  };
}
