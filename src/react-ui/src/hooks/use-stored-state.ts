import { useLoading } from "./use-loading.js";
import { useSafeState } from "./use-safe-state.js";

export interface StateStoreService<T> {
  getAllState(): Promise<T>;
  getState<K extends keyof T>(key: K): Promise<T[K]>;
  setState<K extends keyof T>(key: K, value: T[K]): Promise<void>;
}

export function useStoredState<T>(initState: T, service: StateStoreService<T>): [T, <K extends keyof T>(key: K, value: T[K]) => void, boolean, () => void] {
  const [state, setState] = useSafeState<T>(initState);
  const [loading, loadingScope] = useLoading();
  const fetch = React.useCallback(
    () =>
      loadingScope(async () => {
        const state = await service.getAllState();
        setState(state);
      }),
    []
  );
  React.useEffect(() => {
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
