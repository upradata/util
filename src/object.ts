import { isPlainObject } from './is';
import { Constructor, ObjectOf, OmitType, Prop, ValueOf } from './type';


// Same as Object.entries/keys/values but with better typing
export const entries = <T extends {}>(o: T) => Object.entries(o) as [ keyof T, T[ keyof T ] ][];
export const keys = <T extends {}>(o: T) => Object.keys(o) as [ keyof T ];
export const values = <T extends ObjectOf<any>>(o: T) => Object.values(o) as T[ keyof T ];


// const arr = [ { key: 'a', v: 1 } as const, { key: 'b', v: 2 } as const, { key: 'a', v: 3 } as const ];
// fromKey(arr, 'key' as const, 'a' as const);

// => { key: 'a', v: 1; }
export const fromKey = <O extends {}, K extends keyof O, V extends O[ K ]>(array: O[] | Readonly<O[]>, key: K, value: V): Extract<O, Record<K, V>> => array.find(el => el[ key ] === value) as any;

// fromKeyAll(arr, 'key' as const, 'a' as const); => [ { key: 'a', v: 1; }, { key: 'a', v: 3; } ]
export const fromKeyAll = <O extends {}, K extends keyof O, V extends O[ K ]>(array: O[] | Readonly<O[]>, key: K, value: V): Extract<O, Record<K, V>>[] => array.filter(el => el[ key ] === value) as any;


// toObject([ { key: 'a' as const, v: 1 }, { key: 'b' as const, v: 2 } ], 'key') => 
// { a: { key: 'a' as const, v: 1 }, b: { key: 'b' as const, v: 2 } };
export const toObject = <O extends ObjectOf<any>, K extends keyof O>(array: O[] | Readonly<O[]>, key: K): { [ Key in O[ K ] ]: O } =>
    array.reduce((o, curr) => ({ ...o, [ curr[ key ] ]: curr }), {} as any) as any;


// removeUndefined({ a: 1, b: 2, c: undefined as undefined, d: 2 }); => { a: 1, b: 2, d: 2; }
export const removeUndefined = <O extends {}>(o: O): OmitType<O, undefined> => Object.fromEntries(entries(o).filter(([ _, v ]) => typeof v !== 'undefined')) as any;


// props = a.b.c.d for instance
// getRecursive(o, props) => get o.a.b.c.d
// if prop does not exist, return undefined
export const getRecursive = <O extends object>(o: O, props: string) => props.split('.').reduce((obj, p) => obj[ p ] || {}, o);

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
type Unpacked<T> = T extends (infer U)[] ? U : T;

type MakeObjectKlassHandler<Klass extends Constructor> = (key: keyof InstanceType<Klass>, value?: ValueOf<InstanceType<Klass>>, arg?: InstanceType<Klass>) => any;

type MakeObjectObjHandler<O extends {}> = (key: keyof O, value?: ValueOf<O>, arg?: O) => any;

type MakeObjectArrayHandler<Keys extends Prop[]> = (key: Keys[ number ], arg?: Prop[]) => any;

export function makeObject<Klass extends Constructor, V extends MakeObjectKlassHandler<Klass>>(klass: Klass, value: V): Record<keyof InstanceType<Klass>, ReturnType<V>>;

export function makeObject<Keys extends Prop[], V extends MakeObjectArrayHandler<Keys>>(k: Keys, value: V): Record<Keys[ number ], ReturnType<V>>;

export function makeObject<O extends {}, V extends MakeObjectObjHandler<O>>(obj: O, value: V): Record<keyof O, ReturnType<V>>;

export function makeObject(arg: Prop[] | object | Constructor, value: (k: Prop, valueOrArg: any, arg?: object) => any): object {
    const values = Array.isArray(arg) ? arg : arg.constructor && typeof arg === 'function' ? new (arg as Constructor)() : arg;
    const keys = Array.isArray(arg) ? arg : Object.keys(values);

    return keys.reduce((o, k) => {
        o[ k ] = Array.isArray(arg) ? value(k, arg) : value(k, arg[ k ], arg);
        return o;
    }, {} as any);
}
