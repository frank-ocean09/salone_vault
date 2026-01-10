import { useCallback, useState } from 'react';

export function useSelection(initial: string[] = []) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initial);

  const toggle = useCallback((id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const clear = deselectAll;

  return {
    selectedIds,
    toggle,
    selectAll,
    deselectAll,
    clear,
  };
}
