import { useCallback, useEffect } from "react";
import { useLoading } from "./use-loading";
import { useSafeState } from "./use-safe-state";

export interface StateStoreService<T> {
  getAllState(): Promise<T>;
  getState<K extends keyof T>(key: K): Promise<T[K]>;
  setState<K extends keyof T>(key: K, value: T[K]): Promise<void>;
}

export function useStoredState<T>(
  initState: T,
  service: StateStoreService<T>
): [T, <K extends keyof T>(key: K, value: T[K]) => void, boolean, () => void] {
  const [state, setState] = useSafeState<T>(initState);
  const [loading, loadingScope] = useLoading();
  const fetch = useCallback(
    () =>
      loadingScope(async () => {
        const serverStates = await service.getAllState();
        setState(serverStates);
      }),
    []
  );
  useEffect(() => {
    fetch();
  }, []);
  async function setStoredState<K extends keyof T>(key: K, value: T[K]) {
    loadingScope(async () => {
      await service.setState(key, value);
      const newValue = await service.getState(key);
      setState((current) => ({
        ...current,
        [key]: newValue,
      }));
    });
  }
  return [state, setStoredState, loading, fetch];
}
