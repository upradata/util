import { Key, Arr, TupleSize, Levels } from '../types';

type Indexes = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ];

type O<Keys extends Arr<Arr<Key>>, R, I extends number = 0> = {
    [ Key in Keys[ I ][ number ] ]: TupleSize<Keys> extends 0 ? [] : I extends Levels[ TupleSize<Keys> ] | 20 ? R : O<Keys, R, Indexes[ I ]>;
};

export const makeDeepObject = <Keys extends Arr<Arr<Key>>, R>(keys: Keys, value: (key: Keys[ Levels[ TupleSize<Keys> ] ][ number ]) => R): O<Keys, R> => {
    const make = (keys: Arr<Arr<Key>>) => {
        const [ head, ...rest ] = keys;

        const last = rest.length === 0;

        return (head as Key[]).reduce((current, key) => ({
            ...current,
            [ key ]: last ? value(key) : make(rest)
        }), {});
    };

    return make(keys);
};

/* const o = makeDeepObject([ [ 'a', 'b', 'c' ], [ 'a1', 'b2', 'c2' ] ] as const, k => `value ${ k }` as const);
const a = o.c.c2;
a === 'value a1'; */
