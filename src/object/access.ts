import { arrayFromIterable } from '../useful';
import { RecordOf } from '../types';
import { Constructor0 } from '../function';



// Same as Object.entries/keys/values but with better typing
export const entries = <T extends {}>(o: T) => Object.entries(o) as [ keyof T, T[ keyof T ] ][];
export const fromEntries = <T extends {}>(entries: [ keyof T, T[ keyof T ] ][]) => Object.fromEntries(entries) as { [ K in keyof T ]: T[ K ]; };

type KeyType<T> = T extends Constructor0 ? InstanceType<T> : T;
// T extends T is to enable the distribution
// for instance T = A | B | C => Array<keyof A | keyof B | keyof C> instead of Array<keyof (A | B | C)>
export const keys = <T extends Constructor0 | {}>(o: T): T extends T ? Array<keyof KeyType<T>> : never => {
    return Object.keys((o as Constructor0).prototype ? new (<Constructor0>o)() : o) as any;
};
/* const k1 = keys({ a: 1, b: 2 });
const k2 = keys(class A { a: 1; b: 2; }); */

export const values = <T extends RecordOf<any>>(o: T) => Object.values(o) as Array<T[ keyof T ]>;


// const arr = [ { key: 'a', v: 1 } as const, { key: 'b', v: 2 } as const, { key: 'a', v: 3 } as const ];
// fromKey(arr, 'key' as const, 'a' as const);

// => { key: 'a', v: 1; }
//
export const fromKey = <O extends {}, K extends keyof O, V extends O[ K ]>(it: Iterable<O>, key: K, value: V): Extract<O, Record<K, V>> => {
    return arrayFromIterable(it).find(el => el[ key ] === value) as any;
};

export const findFromKey = fromKey;

// fromKeyAll(arr, 'key' as const, 'a' as const); => [ { key: 'a', v: 1; }, { key: 'a', v: 3; } ]
export const fromKeyAll = <O extends {}, K extends keyof O, V extends O[ K ]>(it: Iterable<O>, key: K, value: V): Extract<O, Record<K, V>>[] => {
    return arrayFromIterable(it).filter(el => el[ key ] === value) as any;
};

export const findFromKeyAll = fromKeyAll;
