import { Union, of, UnionValG, Generic, Of, GenericUnionObj } from 'ts-union';
import { returnSelf, reverseCurry } from './utils';

const R = Union(t => ({ Err: of<any>(), Ok: of(t) }));

type ResRecord<E> = { Err: Of<[E]>; Ok: Of<[Generic]> };

type ResVal<E, T> = UnionValG<T, ResRecord<E>>;

export interface MapFunc<E> {
  <A, B>(val: ResVal<E, A>, f: (a: A) => B): ResVal<E, B>;
  <A, B>(f: (a: A) => B): (val: ResVal<E, A>) => ResVal<E, B>;
}

const evalMap = <E, A, B>(val: ResVal<E, A>, f: (a: A) => B) =>
  R.if.Ok(val, a => R.Ok(f(a)), returnSelf);

export interface BindFunc<E> {
  <A, B>(val: ResVal<E, A>, f: (a: A) => ResVal<E, B>): ResVal<E, B>;
  <A, B>(f: (a: A) => ResVal<E, B>): (val: ResVal<E, A>) => ResVal<E, B>;
}
const evalBind = <E, A, B>(val: ResVal<E, A>, f: (a: A) => ResVal<E, B>) =>
  R.if.Ok(val, f, returnSelf);

const Res = {
  ...R,
  map: reverseCurry<MapFunc<any>>(evalMap),
  bind: reverseCurry<BindFunc<any>>(evalBind)
};

export type ResUnion<E> = GenericUnionObj<ResRecord<E>> & {
  map: MapFunc<E>;
  bind: BindFunc<E>;
};

export const buildResultWithErr = <TErr>(): ResUnion<TErr> => Res as any;
