import { useCallback } from "react";
import { useSafeState } from "./use-safe-state";

export function useLoading(): [
  boolean,
  (handler: () => Promise<void>) => Promise<void>,
  React.Dispatch<React.SetStateAction<boolean>>
] {
  const [loading, setLoading] = useSafeState(false);
  const loadingScope = useCallback(async (handler: () => Promise<void>) => {
    try {
      setLoading(true);
      await handler();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);
  return [loading, loadingScope, setLoading];
}
