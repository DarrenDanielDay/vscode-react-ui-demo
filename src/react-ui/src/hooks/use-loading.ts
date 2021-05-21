import { useSafeState } from "./use-safe-state.js";

export function useLoading(): [boolean, (handler: () => Promise<void>) => Promise<void>, React.Dispatch<React.SetStateAction<boolean>>] {
  const [loading, setLoading] = useSafeState(false);
  const loadingScope = React.useCallback(
    async (handler: () => Promise<void>) => {
      try {
        setLoading(true);
        await handler();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    []
  );
  return [loading, loadingScope, setLoading];
}
