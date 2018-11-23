export interface Fn<T, R> {
  (val: T): R;
}
// export function pipe<T>(): Fn<T, T>;
export function pipe<T, A>(fn1: Fn<T, A>): Fn<T, A>;
export function pipe<T, A, B>(fn1: Fn<T, A>, fn2: Fn<A, B>): Fn<T, B>;
export function pipe<T, A, B, C>(
  fn1: Fn<T, A>,
  fn2: Fn<A, B>,
  fn3: Fn<B, C>
): Fn<T, C>;
export function pipe<T, A, B, C, D>(
  fn1: Fn<T, A>,
  fn2: Fn<A, B>,
  fn3: Fn<B, C>,
  fn4: Fn<C, D>
): Fn<T, D>;
export function pipe<T, A, B, C, D, E>(
  fn1: Fn<T, A>,
  fn2: Fn<A, B>,
  fn3: Fn<B, C>,
  fn4: Fn<C, D>,
  fn5: Fn<D, E>
): Fn<T, E>;
export function pipe<T, A, B, C, D, E, F>(
  fn1: Fn<T, A>,
  fn2: Fn<A, B>,
  fn3: Fn<B, C>,
  fn4: Fn<C, D>,
  fn5: Fn<D, E>,
  fn6: Fn<E, F>
): Fn<T, F>;
export function pipe<T, A, B, C, D, E, F, G>(
  fn1: Fn<T, A>,
  fn2: Fn<A, B>,
  fn3: Fn<B, C>,
  fn4: Fn<C, D>,
  fn5: Fn<D, E>,
  fn6: Fn<E, F>,
  fn7: Fn<F, G>
): Fn<T, G>;
export function pipe<T, A, B, C, D, E, F, G, H>(
  fn1: Fn<T, A>,
  fn2: Fn<A, B>,
  fn3: Fn<B, C>,
  fn4: Fn<C, D>,
  fn5: Fn<D, E>,
  fn6: Fn<E, F>,
  fn7: Fn<F, G>,
  fn8: Fn<G, H>
): Fn<T, H>;
export function pipe<T, A, B, C, D, E, F, G, H, I>(
  fn1: Fn<T, A>,
  fn2: Fn<A, B>,
  fn3: Fn<B, C>,
  fn4: Fn<C, D>,
  fn5: Fn<D, E>,
  fn6: Fn<E, F>,
  fn7: Fn<F, G>,
  fn8: Fn<G, H>,
  fn9: Fn<H, I>
): Fn<T, I>;
export function pipe<T, A, B, C, D, E, F, G, H, I>(
  fn1: Fn<T, A>,
  fn2: Fn<A, B>,
  fn3: Fn<B, C>,
  fn4: Fn<C, D>,
  fn5: Fn<D, E>,
  fn6: Fn<E, F>,
  fn7: Fn<F, G>,
  fn8: Fn<G, H>,
  fn9: Fn<H, I>,
  ...fns: Fn<any, any>[]
): Fn<T, {}>;

export function pipe(...fns: Array<Fn<any, any>>): Fn<any, any> {
  return pipeFromArray(fns);
}

const pipeFromArray = <T, R>(fns: Array<Fn<T, R>>): Fn<T, R> =>
  fns.length === 1
    ? fns[0]
    : (input: T): R =>
        fns.reduce((prev: any, fn: Fn<T, R>) => fn(prev), input as any);
