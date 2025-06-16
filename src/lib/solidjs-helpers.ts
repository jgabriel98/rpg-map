import { Accessor, createMemo, createSignal, Setter } from 'solid-js';

export function createAsyncSignal<T>(fn: Accessor<T>) {
  const signal = createMemo(() => createSignal(fn()));
  const get: Accessor<T> = () => signal()[0]();
  // @ts-expect-error: solidjs got confused
  const set: Setter<T> = (v) => signal()[1](v);
  return [get, set] as ReturnType<typeof createSignal<T>>;
}