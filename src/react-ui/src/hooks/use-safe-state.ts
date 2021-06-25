import type React from "react";
import { useEffect, useRef, useState } from "react";
export function useSafeState<T>(
  initState: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const isValidLifeCycle = useRef(true);
  const [internalState, setInternalState] = useState(initState);
  useEffect(
    () => () => {
      isValidLifeCycle.current = false;
    },
    []
  );
  function setState(action: React.SetStateAction<T>) {
    if (isValidLifeCycle.current) {
      setInternalState(action);
    }
  }
  return [internalState, setState];
}
