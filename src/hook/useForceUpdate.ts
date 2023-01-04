import { useReducer } from "preact/hooks";

const increment = (i: number) => i + 1;
export const useForceUpdate = (): (() => void) => useReducer<number, void>(increment, 0)[1];
