import { useReducer } from "react";

export function useForceUpdate() {
  const [, forceUpdate] = useReducer((count: number) => count + 1, 0);
  return forceUpdate;
}
