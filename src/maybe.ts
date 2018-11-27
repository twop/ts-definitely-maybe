import { Union, of, GenericValType, Of, Generic } from 'ts-union';
import { reverseCurry, returnSelf } from './utils';

export type MaybeRec = { Nothing: Of<[void]>; Just: Of<[Generic]> };

const M = Union(
  (val): MaybeRec => ({
    Nothing: of(),
    Just: of(val)
  })
);

export type MaybeVal<T> = GenericValType<T, typeof M.T>;

export interface MapFunc {
  <A, B>(val: MaybeVal<A>, f: (a: A) => B): MaybeVal<B>;
  <A, B>(f: (a: A) => B): (val: MaybeVal<A>) => MaybeVal<B>;
}
const evalMap = <A, B>(val: MaybeVal<A>, f: (a: A) => B) =>
  M.if.Just(val, a => M.Just(f(a)), returnSelf);

export interface BindFunc {
  <A, B>(val: MaybeVal<A>, f: (a: A) => MaybeVal<B>): MaybeVal<B>;
  <A, B>(f: (a: A) => MaybeVal<B>): (val: MaybeVal<A>) => MaybeVal<B>;
}

const evalBind = <A, B>(val: MaybeVal<A>, f: (a: A) => MaybeVal<B>) =>
  M.if.Just(val, f, returnSelf);

export const Maybe = {
  ...M,
  map: reverseCurry<MapFunc>(evalMap),
  bind: reverseCurry<BindFunc>(evalBind)
};
