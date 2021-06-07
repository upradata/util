import { isDefined, isPlainObject } from '../is';
import { Key } from '../type';
import { entries } from './access';
import { ConcatenatedKeysRecursive } from './recursive.type';


/* const o = {
    a: 1,
    b: {
        b1: 1, b2: 2,
    },
    c: {
        c1: {
            c2: {
                c3: 3, c4: 4
            },
        },
    },
}; */



// const flatKey: FlatKeys<typeof o>; =>  "a" | "b.b1" | "b.b2" | "c.c1.c2.c3" | "c.c1.c2.c4";
// const flatKeys = keysRecursive(o); => Array<"a" | "b.b1" | "b.b2" | "c.c1.c2.c3" | "c.c1.c2.c4">

export type FlattenMergeKey = (key1: Key, key2: Key) => Key;

export class FlattenObjectOption {
    mergeKeys?: FlattenMergeKey = (k1: string, k2: string) => isDefined(k2) ? `${k1}.${k2}` : k1;
    nbLevels?: number = NaN;
}



export const keysRecursive = <O extends {}>(o: O, option?: FlattenObjectOption): ConcatenatedKeysRecursive<O> => {
    const { mergeKeys, nbLevels } = Object.assign(new FlattenObjectOption(), option);

    const keys = <U>(o: U): ConcatenatedKeysRecursive<U> => {
        return entries(o).flatMap(([ k, v ], level) => {
            if (isPlainObject(v) && level + 1 !== nbLevels)
                return keys<{}>(v).map(key => mergeKeys(k, key));

            return [ mergeKeys(k, undefined) ];
        }) as any;
    };

    return keys(o);
};



// props = a.b.c.d for instance
// getRecursive(o, props) => get o.a.b.c.d
// if prop does not exist, return undefined
export const getRecursive = <O extends {}>(o: O, key: ConcatenatedKeysRecursive<O>) => {
    return typeof key === 'string' ? (key as string).split('.').reduce((obj, p) => obj?.[ p ], o) : o[ key as any ];
};


// setRecursive(o, props, value) sets o.a.b.c.d = value
// if a prop does not exist, it is created as {}
export const setRecursive = <O extends {}>(o: O, key: ConcatenatedKeysRecursive<O>, value: any): O => {
    if (typeof key === 'string') {

        (key as string).split('.').reduce((obj, p, i, arr) => {
            return obj[ p ] = i === arr.length - 1 ? value : obj[ p ] || {};
        }, o);

    } else {
        o[ key as any ] = value;
    }

    return o;
};


export const set = setRecursive;
export const get = getRecursive;
