# ts-definitely-maybe

Exposes minimal set of helpers to work with `Maybe`, `Result` union types + a `pipe` function. Based on [ts-union](https://github.com/twop/ts-union) library.

### NOTE: work in progress

## Installation

```
npm add ts-definitely-maybe ts-union
```

NOTE: Requires peer dependency on [ts-union](https://github.com/twop/ts-union) + uses features from typescript 3.0 (such as `unknown` type)

## `Maybe`

### `map`

Produces `MaybeVal<B>` from `MaybeVal<A>` with a function `f(a:A) => B`.

```ts
import { Maybe } from 'ts-definitely-maybe';
const { map, Just, Nothing } = Maybe;

// inferred type for n is number;
map(Just(1), n => n + 1); // Just(2)

// have to explicitly provide <number> type parameter
map(Nothing<number>(), n => n + 1); // Nothing

// curried version

// omit union value to construct a function instead
// typeof stringify === (v:MaybeVal<number>) => MaybeVal<string>
const stringify = map((n: number) => n.toString());
stringify(Just(1)); // Just('1')

// in here you can omit <number>. ts will correctly infer it.
stringify(Nothing()); // Nothing
```

### `bind`

Produces `MaybeVal<B>` from `MaybeVal<A>` with a function `f(a:A) => MaybeVal<B>`.

Useful for modeling operations that depend on the prev step result (aka Sequence).

```ts
const { bind, Just, Nothing } = Maybe;

// inferred type for n is number;
bind(Just(1), n => Just(n + 1)); // Just(2)

// have to explicitly provide <number> type parameter
bind(Nothing<number>(), n => Just(n + 1)); // Nothing

// curried version is similar to map

// omit union value to construct a function instead
// typeof stringify === (v:MaybeVal<number>) => MaybeVal<string>
const stringify = bind((n: number) => Just(n.toString()));
stringify(Just(1)); // Just('1')
stringify(Nothing()); // Nothing
```

## `Result`

Behaves really similar to `Maybe` but the `Err` case has payload. `Err` payload type has to be specified at the moment of creation.

### Creating a Result type specifying error.

Note this api is probably going to change. I'm not a huge fan of the name and ergonomics of it.

```ts
import { buildResultWithErr } from 'ts-definitely-maybe';

// ResUnion<string>. Bakes in potential string errors.
const MyResult = buildResultWithErr<string>();

const ResultWithException = buildResultWithErr<Error>();

// this also works
const ResWithStrOrError = buildResultWithErr<Error | string>();
```

### `map`

```ts
const { map, Ok, Err } = MyRes;

map(Ok(1), n => n.toString()); // Ok(2)

map(Err<number>('oops'), n => n + 1); // Err('oops')

// curried version
const double = map((n: number) => n * 2);
double(Ok(1)); // Ok(2)
double(Err('e')); // Err('e')
```

### `bind`

Useful for modeling any sort of validation and for [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/).

```ts
const { map, bind, Ok, Err } = MyRes;

bind(Ok(1), n => Ok(n + 1)); // Ok(2)
bind(Err<number>('oops'), n => Ok(n + 1)); // Err('oops')

// More fun example with pipe
import { pipe } from 'ts-definitely-maybe';

type Person = { first: string; last: string; age: number };

// Takes Res<Person> and returns Res<string>
const canDrink = pipe(
  map(({ first, last, age }: Person) => ({
    name: `${first} ${last}`,
    age
  })),
  bind(({ name, age }) => (age >= 21 ? Ok('Sure') : Err(`Nope, ${name}`)))
);

canDrink(Ok<Person>({ first: 'Too', last: 'Young', age: 18 }));
// Err('Nope, Too Young')

canDrink(Ok<Person>({ first: 'Old', last: 'Enough', age: 45 }));
// Ok('Sure')

canDrink(Err('oops'));
// Err('oops')
```

## `pipe`

Just an utility function to build pipelines. Almost 100% copypaste from RxJs `pipe` operator.

Typings + iml:

```ts
export interface Fn<T, R> {
    (val: T): R;
}
export interface Pipe {
    <T, A>(fn1: Fn<T, A>): Fn<T, A>;
    <T, A, B>(fn1: Fn<T, A>, fn2: Fn<A, B>): Fn<T, B>;
    <T, A, B, C>(fn1: Fn<T, A>, fn2: Fn<A, B>, fn3: Fn<B, C>): Fn<T, C>;
    ...
}

export const pipe: Pipe = (...fns: Array<Fn<any, any>>): Fn<any, any> => (
  input: any
) => fns.reduce((prev: any, fn: Fn<any, any>) => fn(prev), input);
```

## `match` & `if` for `Maybe` and `Result`

These functions came from [ts-union](https://github.com/twop/ts-union) library but still useful to mention them here

### for `Maybe`

```ts
const { match, Just, Nothing } = Maybe;

match(Just(1), { Just: n => n, Nothing: () => 0 }); // 1

//curried version
const valueOrZero = match({ Just: (n: number) => n, Nothing: () => 0 });
valueOrZero(Just(1)); // 1
valueOrZero(Nothing<number>()); // 0

const val = Just(1);
Maybe.if.Just(val, n => n, () => 0); // 1
```

### for `Result`

```ts
const { match, Ok, Err } = MyRes;

match(Ok(1), { Ok: n => n, Err: _ => -1 }); // 1
match(Err<number>('err'), { Ok: n => n.toString(), Err: s => s }); // 'err'

//curried version
const toStrOrErr = match({
  Ok: (n: number) => n.toString(),
  Err: e => e
});

toStrOrErr(Ok(1)); // '1'
toStrOrErr(Err<number>('err')); // 'err'

const val = Ok(1);
MyRes.if.Ok(val, n => n, () => 0); // 1
```
