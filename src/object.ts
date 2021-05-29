import { isDefined, isDefinedProp, isPlainObject } from './is';
import { Constructor, Constructor0, InferRecordType, Key, RecordOf, OmitType, ValueOf, Arr, TupleSize, AnyFunction } from './type';
import { arrayFromIterable } from './useful';


// Same as Object.entries/keys/values but with better typing
export const entries = <T extends {}>(o: T) => Object.entries(o) as [ keyof T, T[ keyof T ] ][];

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
export const fromKey = <O extends {}, K extends keyof O, V extends O[ K ]>(it: Iterable<O>, key: K, value: V): Extract<O, Record<K, V>> => arrayFromIterable(it).find(el => el[ key ] === value) as any;

export const findFromKey = fromKey;

// fromKeyAll(arr, 'key' as const, 'a' as const); => [ { key: 'a', v: 1; }, { key: 'a', v: 3; } ]
export const fromKeyAll = <O extends {}, K extends keyof O, V extends O[ K ]>(it: Iterable<O>, key: K, value: V): Extract<O, Record<K, V>>[] => arrayFromIterable(it).filter(el => el[ key ] === value) as any;

export const findFromKeyAll = fromKeyAll;

// toObject([ { key: 'a' as const, v: 1 }, { key: 'b' as const, v: 2 } ], 'key', 'value') => { a: { key: 'a', v: 1 }, b: { key: 'b', v: 2 } };
// toObject([ { key: 'a', v: 1 }, { key: 'b', v: 2 }, { key: 'a', v: 3 } ], 'key', 'array') => { a: [ { key: 'a', v: 1 }, { key: 'a', v: 3 } ], b: [ { key: 'b', v: 2 } ] };
// export const toObject = <O extends RecordOf<any>, K extends keyof O, M extends 'value' | 'array' = 'array'>(array: O[] | Readonly<O[]>, key: K, mode: M = 'value' as M): { [ /// Key in O[ K ] ]: M extends 'value' ? O : O[] } => {
export const toObject = <O extends RecordOf<any>, K extends keyof O, M extends 'value' | 'array' = 'value'>(it: Iterable<O>, key: K, mode: M = 'value' as M): { [ Key in O[ K ] ]: M extends 'value' ? O : O[] } => {
    return arrayFromIterable(it).reduce((o, curr) => {
        const k = curr[ key ];
        o[ k ] = mode === 'value' ? curr : [ ...(o[ k ] || []), curr ] as any;

        return o;
        // return { ...o, [ k ]: mode === 'value' ? curr : [ ...(o[ k ] || []), curr ] };
    }, {} as any) as any;
};

// toArray({ a: { k1: 1, k2: 2 }, b: { k1: 3, k2: 4 } }, 'key') => [ { key: 'a', k1: 1, k2: 2 }, { key: 'b', k1: 3, k2: 4 } ]
// toArray({ a: { k1: 1, k2: 2 }, b: { k1: 3, k2: 4 } }, undefined) => [ { k1: 1, k2: 2 }, { k1: 3, k2: 4 } ]
type ToArrayValue<T> = InferRecordType<T> extends {} ? InferRecordType<T> : { value: T; };
type ToArrayReturn<T, OnlyValues extends boolean, Extra = {}> = OnlyValues extends true ? ToArrayValue<T> : ToArrayValue<T> & Extra;
type KeyOf<T> = InferRecordType<T> extends {} ? keyof T : T;

export class ToArrayOptions<T extends {}> {
    onlyValues?: boolean = false;
    filter?: (key: keyof T, value?: T[ keyof T ]) => boolean = (k, v) => true;
    keyName?: Key = 'key';
}


// export function toArray<T extends {}, O extends ToArrayOptions>(o: T, options?: O): ToArrayReturn<O, O[ 'onlyValues' ] extends true ? {} : { key: KeyOf<O>; }>[] {
// export function toArray<O extends {}, K extends Key = 'key'>(o: O, keyName?: K): ToArrayReturn<O, { [ k in K ]: KeyOf<O> }>[];
// export function toArray<O>(o: O, keyName?: Key): O[] {

type ToArrayKey<O extends ToArrayOptions<any>> = O extends never ? 'key' : O[ 'keyName' ];

export function toArray<T extends {}, O extends ToArrayOptions<T>>(o: T, options?: Partial<O>): ToArrayReturn<T, O[ 'onlyValues' ], { [ P in ToArrayKey<O> ]: KeyOf<T> }>[] {

    const { onlyValues, filter, keyName } = Object.assign(new ToArrayOptions(), options) as ToArrayOptions<any>;

    return Object.entries(o).filter(([ k, v ]) => filter(k, v)).map(([ k, v ]) => {
        const value = typeof v === 'object' ? v : { value: v };

        if (onlyValues)
            return v as any;

        return { [ keyName ]: k, ...value };
    });
};


/* const a = toArray({ a: { k1: 1, k2: 2 }, b: { k1: 3, k2: 4 } } as const, { keyName: 'id', filter: (k, v) => k === 'a' });
const b = toArray({ a: { k1: 1, k2: 2 }, b: { k1: 3, k2: 4 } } as const, { keyName: 'id' });
const c = toArray({ a: { k1: 1, k2: 2 }, b: { k1: 3, k2: 4 } } as const, { keyName: 'id', onlyValues: true });
const d = toArray({ a: { k1: 1, k2: 2 }, b: { k1: 3, k2: 4 } } as const);
const e = toArray({ a: 1, b: { k1: 3, k2: 4 } } as const);
const f = toArray({ a: 1, b: { k1: 3, k2: 4 } } as const, { onlyValues: true });

console.log(a, b, c, d, e, f);
debugger; */


export type ObjectFilter<V> = (k: Key, v: V) => boolean;
export const filter = <O extends {}>(o: O, filter: ObjectFilter<ValueOf<O>>): O => Object.fromEntries(entries(o).filter(([ k, v ]) => filter(k, v))) as any;

// removeUndefined({ a: 1, b: 2, c: undefined as undefined, d: 2 }); => { a: 1, b: 2, d: 2; }
export const removeUndefined = <O extends {}>(o: O): OmitType<O, undefined> => filter(o, (_, v) => typeof v !== 'undefined');


// props = a.b.c.d for instance
// getRecursive(o, props) => get o.a.b.c.d
// if prop does not exist, return undefined
export const getRecursive = <O extends object>(o: O, key: Key) => typeof key === 'string' ? key.split('.').reduce((obj, p) => obj?.[ p ], o) : o[ key ];

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

// const o = { a: 1, b: { b1: { b2: 2 } } }; => [ 'a', 'b.b1.b2' ];

export type FlattenMergeKey = (key1: Key, key2: Key) => Key;

export class FlattenObjectOption {
    mergeKeys?: FlattenMergeKey = (k1: string, k2: string) => isDefined(k2) ? `${k1}.${k2}` : k1;
    nbLevels?: number = NaN;
}

export type KeysRecursiveReturn<O extends {}> = FlatKeys<O> extends any ? string[] : FlatKeys<O>[];

export const keysRecursive = <O extends {}>(o: O, option?: FlattenObjectOption): KeysRecursiveReturn<O> => {
    const { mergeKeys, nbLevels } = Object.assign(new FlattenObjectOption(), option);

    const keys = <U>(o: U): KeysRecursiveReturn<U> => {
        return entries(o).flatMap(([ k, v ], level) => {
            if (isPlainObject(v) && level + 1 !== nbLevels)
                return keys<{}>(v).map(key => mergeKeys(k, key));

            return [ mergeKeys(k, undefined) ];
        }) as any;
    };

    return keys(o);
};


// create object from keys
// makeObject([ 'a', 'b', 'c' ] as const, k => `value: ${ k }` as const);
// makeObject([ 'a', 'b', 'c' ] as const, k => ({ key: k, value: `value: ${ k }` as const }))
// makeObject({ a: 1, b: 2, c: 3 }, k => `value: ${ k }` as const);
// makeObject(class { a: 1; b: 2; c: 3; }, k => `value: ${ k }` as const);
// gives the same result => { a: 'value a', b: 'value b', c: 'value c' };

// input is Class with default constructor
// handler returns a value
type MakeObjectKlassHandler<Klass extends Constructor> = (key: keyof InstanceType<Klass>, value?: ValueOf<InstanceType<Klass>>, arg?: InstanceType<Klass>) => any;

// input is an object
// handler returns a value
type MakeObjectObjHandler<O extends {}> = (key: keyof O, value?: ValueOf<O>, arg?: O) => any;

// input is an array with keys
// handler returns a value
type MakeObjectArrayHandlerWithKeys<Keys extends Arr<Key>> = (key: Keys[ number ], arg?: Key[]) => any;

// input is an array with values
// handler return a { key, value }
type MakeObjectArrayHandlerWithValues<Values extends Arr<any>> = (value: Values[ number ], arg?: Key[]) => { key: Key; value: any; };


type MakeObjectReturn<V extends AnyFunction, T> = ReturnType<V> extends { key: any; value: any; } ?
    Record<ReturnType<V>[ 'key' ], ReturnType<V>[ 'value' ]> :
    Record<keyof T, ReturnType<V>>;


export function makeObject<Klass extends Constructor, V extends MakeObjectKlassHandler<Klass>>(klass: Klass, value: V): MakeObjectReturn<V, InstanceType<Klass>>;

export function makeObject<Values extends Arr<any>, V extends MakeObjectArrayHandlerWithValues<Values>>(k: Values, value: V): Record<ReturnType<V>[ 'key' ], ReturnType<V>[ 'value' ]>;

export function makeObject<Keys extends Arr<Key>, V extends MakeObjectArrayHandlerWithKeys<Keys>>(k: Keys, value: V): Record<Keys[ number ], ReturnType<V>>;

export function makeObject<O extends {}, V extends MakeObjectObjHandler<O>>(obj: O, value: V): MakeObjectReturn<V, O>;

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

export const map = makeObject;


type Indexes = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ];
type Sizes_1 = [ -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ];

type O<Keys extends Arr<Arr<Key>>, R, I extends number = 0> = {
    [ Key in Keys[ I ][ number ] ]: TupleSize<Keys> extends 0 ? [] : I extends Sizes_1[ TupleSize<Keys> ] | 20 ? R : O<Keys, R, Indexes[ I ]>;
};

export const makeDeepObject = <Keys extends Arr<Arr<Key>>, R>(keys: Keys, value: (key: Keys[ Sizes_1[ TupleSize<Keys> ] ][ number ]) => R): O<Keys, R> => {
    const make = (keys: Arr<Arr<Key>>) => {
        const [ head, ...rest ] = keys;

        const last = rest.length === 0;

        return head.reduce((current, key) => ({
            ...current,
            [ key ]: last ? value(key) : make(rest)
        }), {});
    };

    return make(keys);
};

/* const o = makeDeepObject([ [ 'a', 'b', 'c' ], [ 'a1', 'b2', 'c2' ] ] as const, k => `value ${ k }` as const);
const a = o.c.c2;
a === 'value a1'; */


// getIfDefined({ a: 1, b: 2 }, 'a', 3); => 1
// getIfDefined({ a: 1, b: 2 }, 'c', 3); => 3
export const getIfDefined = <T extends {} | Arr<any>, K extends keyof T>(o: T, key: K, defaultValue: T[ K ] = undefined): T[ K ] => {
    return isDefinedProp(o, key) ? o[ key ] : defaultValue;
};


type PrimitiveRecursive<T> = {
    [ K in keyof T ]: T[ K ] extends object ? PrimitiveRecursive<T[ K ]> : T[ K ]
}[ keyof T ];

type KeysRecursive<T> = keyof T | {
    [ K in keyof T ]: T[ K ] extends object ? KeysRecursive<T[ K ]> : never
}[ keyof T ];

export const forEach = <T extends Arr<any> | {}>(o: T, callback: (key: KeysRecursive<T>, v: PrimitiveRecursive<T>) => void | 'stop', isRecursive: boolean = false): void => {
    let stop = false;

    Object.entries(o).forEach(([ k, v ]) => {
        if (stop)
            return;

        if (typeof v === 'object')
            forEach(v, callback, isRecursive);
        else {
            const ret = callback(k as any, v as any);

            if (ret === 'stop')
                stop = true;
        }
    });
};

// forEach(o, (k, v) => { v === 'b1'; });

export const reduce = <T extends Arr<any> | {}, R>(o: T, init: R, reducer: (current: R, key: KeysRecursive<T>, v: PrimitiveRecursive<T>) => R): R => {

    return Object.entries(o).reduce((current, [ k, v ]) => {

        const value = typeof v === 'object' ? reduce(v, init, reducer) : v;
        return reducer(current, k as any, value as any);

    }, init);
};

// reduce({ a: 1, b: { b1: 1, b2: 2, b3: { b11: 1 } }, c: { c1: 2 }, d: 3 } as const, 0, (current, k, v) => current + v) === 10;
