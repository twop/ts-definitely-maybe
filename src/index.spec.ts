import { Maybe, pipe, buildResultWithErr } from './index';

describe('Maybe', () => {
  const { map, bind, Just, Nothing } = Maybe;

  describe('map', () => {
    it('maps Just -> Just', () => {
      expect(map(Just(1), n => n + 1)).toEqual(Just(2));
    });

    it('maps Nothing -> Nothing', () => {
      expect(map(Nothing<number>(), n => n + 1)).toEqual(Nothing());
    });

    it('curried map waits for a value', () => {
      const stringify = map((n: number) => n.toString());

      expect(stringify(Just(1))).toEqual(Just('1'));
      expect(stringify(Nothing())).toEqual(Nothing());
    });
  });

  describe('bind', () => {
    it('binds Just -> (a -> Just) -> Just', () => {
      expect(bind(Just(1), n => Just(n + 1))).toEqual(Just(2));
    });

    it('binds Nothing -> (a -> Just) -> Nothing', () => {
      expect(bind(Nothing<number>(), n => Just(n + 1))).toEqual(Nothing());
    });

    it('binds Just -> (a -> Nothing) -> Nothing', () => {
      expect(bind(Just(1), _n => Nothing<number>())).toEqual(Nothing());
    });

    it('curried bind waits for a value', () => {
      const stringify = bind((n: number) => Just(n.toString()));

      expect(stringify(Just(1))).toEqual(Just('1'));
      expect(stringify(Nothing())).toEqual(Nothing());
    });
  });

  describe('pipe', () => {
    it('can glue map and bind', () => {
      const toStrAndBack = pipe(
        map((n: number) => n.toString()),
        bind(s => {
          const n = Number(s);
          return Number.isNaN(n) ? Nothing<number>() : Just(n);
        })
      );

      expect(toStrAndBack(Just(1))).toEqual(Just(1));
      expect(toStrAndBack(Nothing<number>())).toEqual(Nothing());
    });
  });
});

describe('Result', () => {
  const { map, bind, Ok, Err } = buildResultWithErr<string>();

  describe('map', () => {
    it('maps Ok a -> Ok b', () => {
      expect(map(Ok(1), n => n.toString())).toEqual(Ok('1'));
    });

    it('maps Err a -> Err b', () => {
      expect(map(Err<number>('oops'), n => n + 1)).toEqual(Err('oops'));
    });

    it('curried map waits for a value', () => {
      const num2str = map((n: number) => n.toString());

      expect(num2str(Ok(1))).toEqual(Ok('1'));
      expect(num2str(Err('e'))).toEqual(Err('e'));
    });
  });

  describe('bind', () => {
    it('binds Ok -> (a -> Ok) -> Ok', () => {
      expect(bind(Ok(1), n => Ok(n + 1))).toEqual(Ok(2));
    });

    it('binds Err -> (a -> Ok) -> Err', () => {
      expect(bind(Err<number>('err'), n => Ok(n + 1))).toEqual(Err('err'));
    });

    it('binds Ok -> (a -> Err) -> Err', () => {
      expect(bind(Ok(1), _n => Err<number>('err'))).toEqual(Err('err'));
    });

    it('curried bind waits for a value', () => {
      const stringify = bind((n: number) => Ok(n.toString()));

      expect(stringify(Ok(1))).toEqual(Ok('1'));
      expect(stringify(Err('err'))).toEqual(Err('err'));
    });
  });

  describe('pipe', () => {
    it('can glue map and bind', () => {
      type Person = { first: string; last: string; age: number };

      const canDrink = pipe(
        map(({ first, last, age }: Person) => ({
          name: `${first} ${last}`,
          age
        })),
        bind(({ name, age }) => (age >= 21 ? Ok('Sure') : Err(`Nope, ${name}`)))
      );

      expect(
        canDrink(Ok<Person>({ first: 'Too', last: 'Young', age: 18 }))
      ).toEqual(Err('Nope, Too Young'));

      expect(
        canDrink(Ok<Person>({ first: 'Old', last: 'Enough', age: 45 }))
      ).toEqual(Ok('Sure'));

      expect(canDrink(Err('oops'))).toEqual(Err('oops'));
    });
  });
});
