# ts-definitely-maybe

### NOTE: work in progress

### The goal is to expose minimal set of helpers to work with `Maybe`, `Result` types + a `pipe` (reversed `compose`) function. Based on ts-union library.

# Code snippets. TODO make a proper api article

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

Useful for modeling any form of validation and rail way programming **TODO insert link to the talk and article**.

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
