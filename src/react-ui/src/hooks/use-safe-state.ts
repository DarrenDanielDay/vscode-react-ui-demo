export function useSafeState<T>(initState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const isValidLifeCycle = React.useRef(true);
  const [internalState, setInternalState] = React.useState(initState);
  React.useEffect(
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
