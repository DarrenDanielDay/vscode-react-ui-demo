export function useForceUpdate() {
    const [, forceUpdate] = React.useReducer((count: number) => count + 1, 0);
    return forceUpdate;
}