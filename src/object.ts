import { isDefinedProp, isPlainObject } from './is';
import { Constructor, InferRecordType, Key, RecordOf, OmitType, ValueOf, Arr } from './type';


// Same as Object.entries/keys/values but with better typing
export const entries = <T extends {}>(o: T) => Object.entries(o) as [ keyof T, T[ keyof T ] ][];
export const keys = <T extends {}>(o: T) => Object.keys(o) as [ keyof T ];
export const values = <T extends RecordOf<any>>(o: T) => Object.values(o) as T[ keyof T ];


// const arr = [ { key: 'a', v: 1 } as const, { key: 'b', v: 2 } as const, { key: 'a', v: 3 } as const ];
// fromKey(arr, 'key' as const, 'a' as const);

// => { key: 'a', v: 1; }
export const fromKey = <O extends {}, K extends keyof O, V extends O[ K ]>(array: O[] | Readonly<O[]>, key: K, value: V): Extract<O, Record<K, V>> => array.find(el => el[ key ] === value) as any;

// fromKeyAll(arr, 'key' as const, 'a' as const); => [ { key: 'a', v: 1; }, { key: 'a', v: 3; } ]
export const fromKeyAll = <O extends {}, K extends keyof O, V extends O[ K ]>(array: O[] | Readonly<O[]>, key: K, value: V): Extract<O, Record<K, V>>[] => array.filter(el => el[ key ] === value) as any;


// toObject([ { key: 'a' as const, v: 1 }, { key: 'b' as const, v: 2 } ], 'key', 'value') => { a: { key: 'a', v: 1 }, b: { key: 'b', v: 2 } };
// toObject([ { key: 'a', v: 1 }, { key: 'b', v: 2 }, { key: 'a', v: 3 } ], 'key', 'array') => { a: { key: 'a', v: [1,3] }, b: { key: 'b', v: [2] } };
export const toObject = <O extends RecordOf<any>, K extends keyof O, M extends 'value' | 'array' = 'array'>(array: O[] | Readonly<O[]>, key: K, mode: M = 'value' as M): { [ Key in O[ K ] ]: M extends 'value' ? O : O[] } => {
    return array.reduce((o, curr) => {
        const k = curr[ key ];
        o[ k ] = mode === 'value' ? curr : [ ...(o[ k ] || []), curr ] as any;

        return o;
        // return { ...o, [ k ]: mode === 'value' ? curr : [ ...(o[ k ] || []), curr ] };
    }, {} as any) as any;
};


// toArray({ a: { k1: 1, k2: 2 }, b: { k1: 3, k2: 4 } }, 'key') => [ { key: 'a', k1: 1, k2: 2 }, { key: 'b', k1: 3, k2: 4 } ]
// toArray({ a: { k1: 1, k2: 2 }, b: { k1: 3, k2: 4 } }, undefined) => [ { k1: 1, k2: 2 }, { k1: 3, k2: 4 } ]
type ToArrayReturn<T, Extra = {}> = (InferRecordType<T> extends {} ? InferRecordType<T> : { value: T; }) & Extra;
type KeyOf<T> = InferRecordType<T> extends {} ? keyof T : T;

export function toArray<O extends {}>(o: O): ToArrayReturn<O, { key: KeyOf<O>; }>[];
export function toArray<O extends {}>(o: O, keyName?: undefined): ToArrayReturn<O>[];
export function toArray<O extends {}, K extends Key = 'key'>(o: O, keyName?: K): ToArrayReturn<O, { [ k in K ]: KeyOf<O> }>[];
export function toArray<O>(o: O, keyName?: Key): O[] {
    const key = arguments.length === 1 ? 'key' : keyName === '' ? undefined : keyName;

    return Object.entries(o).map(([ k, v ]) => {
        const value = typeof v !== 'object' ? v : { value: v };

        if (key === undefined || typeof v !== 'object')
            return value;

        return { [ key ]: k, ...value };
    });
};


// removeUndefined({ a: 1, b: 2, c: undefined as undefined, d: 2 }); => { a: 1, b: 2, d: 2; }
export const removeUndefined = <O extends {}>(o: O): OmitType<O, undefined> => Object.fromEntries(entries(o).filter(([ _, v ]) => typeof v !== 'undefined')) as any;


// props = a.b.c.d for instance
// getRecursive(o, props) => get o.a.b.c.d
// if prop does not exist, return undefined
export const getRecursive = <O extends object>(o: O, props: string) => props.split('.').reduce((obj, p) => obj?.[ p ], o);

// setRecursive(o, props, value) sets o.a.b.c.d = value
// if a prop does not exist, it is created as {}
export const setRecursive = <O extends object>(o: O, props: string, value: any) => props.split('.').reduce((obj, p, i, arr) => {
    return obj[ p ] = i === arr.length - 1 ? value : obj[ p ] || {};
}, o);


/* const o = {
    a: 1,
    b: {
        b1: 1, b2: 2,
    },
    c: {
        c1: {
            c2: {
                c3: 3, c4: 4,
            },
        },
    },
}; */

// const flatKey: FlatKeys<typeof o>; =>  "a" | "b.b1" | "b.b2" | "c.c1.c2.c3" | "c.c1.c2.c4";
// const flatKeys = keysRecursive(o); => Array<"a" | "b.b1" | "b.b2" | "c.c1.c2.c3" | "c.c1.c2.c4">

type Concatanable = string | number | bigint;

type ExtractConcatanable<T> = Extract<T, Concatanable>; // or keyof T & string works also

type Concat<A, B> = B extends '' ? A : `${ExtractConcatanable<A>}.${ExtractConcatanable<B>}`;


// because typescript complains if it can be an infinite recursion => we max out to 20 levels of recurrsion
// (array.prototype.flat is doing so also => see ts definition)
type Levels = [ -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ];

export type FlatKeys<O extends {}, Depth extends number = 20> = ValueOf<{
    [ K in keyof O ]: Depth extends 0 ? '' : O[ K ] extends object ? Concat<K, FlatKeys<O[ K ], Levels[ Depth ]>> : K
}>;

// Same thing but with another implementation inspired by Array.prototype.flat method
/* type FlatKeys2<O extends {}, Depth extends number = 20> = {
    "done": keyof O,
    "recur": ValueOf<{
        [ K in keyof O ]: O[ K ] extends object ? Concat<K, FlatKeys2<O[ K ], Levels[ Depth ]>> : K;
    }>;
}[ Depth extends -1 ? "done" : "recur" ];
 */

export const keysRecursive = <O extends {}>(o: O): FlatKeys<O> extends any ? string[] : FlatKeys<O>[] => entries(o).flatMap(([ k, v ]) => isPlainObject(v) ? keysRecursive<{}>(v).map(key => `${k}.${key}`) as any : [ k ]) as any;



// create object from keys
// makeObject([ 'a', 'b', 'c' ], k => `value: ${k}`);
// makeObject({ a: 1, b: 2, c: 3 }, k => `value: ${k}`);
// makeObject(class { a: 1; b: 2; c: 3; }, k => `value: ${k}`);
// gives the same result => { a: 'value a', b: 'value b', c: 'value c' };

type MakeObjectKlassHandler<Klass extends Constructor> = (key: keyof InstanceType<Klass>, value?: ValueOf<InstanceType<Klass>>, arg?: InstanceType<Klass>) => any;

type MakeObjectObjHandler<O extends {}> = (key: keyof O, value?: ValueOf<O>, arg?: O) => any;

type MakeObjectArrayHandlerWithKeys<Keys extends Key[]> = (key: Keys[ number ], arg?: Key[]) => any;
type MakeObjectArrayHandlerWithValues<Values extends any[]> = (key: Values[ number ], arg?: Key[]) => { key: Key; value: any; };

export function makeObject<Klass extends Constructor, V extends MakeObjectKlassHandler<Klass>>(klass: Klass, value: V): Record<keyof InstanceType<Klass>, ReturnType<V>>;

export function makeObject<Keys extends Key[], V extends MakeObjectArrayHandlerWithKeys<Keys>>(k: Keys, value: V): Record<Keys[ number ], ReturnType<V>>;
export function makeObject<Values extends any[], V extends MakeObjectArrayHandlerWithValues<Values>>(k: Values, value: V): Record<ReturnType<V>[ 'key' ], ReturnType<V>[ 'value' ]>;

export function makeObject<O extends {}, V extends MakeObjectObjHandler<O>>(obj: O, value: V): Record<keyof O, ReturnType<V>>;

export function makeObject(arg: Key[] | object | Constructor, value: (k: Key, valueOrArg: any, arg?: object) => any): object {
    const values = Array.isArray(arg) ? arg : arg.constructor && typeof arg === 'function' ? new (arg as Constructor)() : arg;
    const keys = Array.isArray(arg) ? arg : Object.keys(values);

    return keys.reduce((o, k) => {
        const r = Array.isArray(arg) ? value(k, arg) : value(k, arg[ k ], arg);

        const key = r.key || k;
        const v = r.key ? r.value : r;

        o[ key ] = v;
        return o;
    }, {} as any);
}


// getIfDefined({ a: 1, b: 2 }, 'a', 3); => 1
// getIfDefined({ a: 1, b: 2 }, 'c', 3); => 3
export const getIfDefined = <T extends {} | Arr<any>, K extends keyof T>(o: T, key: K, defaultValue: T[ K ] = undefined): T[ K ] => {
    return isDefinedProp(o, key) ? o[ key ] : defaultValue;
};
