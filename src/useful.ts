import { isArray, isDefined, isPlainObject, isPromise } from './is';
import { Constructor, ObjectOf, Prop } from './type';

// chain(() => o.a.b.c) ==> if a prop doesn't exist ==> return defaultValue
export function chain<T>(exp: () => T, defaultValue: T = undefined) {
    try {
        /* const val = exp();
        if (val != null) {
            return val;
        } */
        return exp();
    } catch (e) {
        if (!(isErrorOf(e, ReferenceError) || isErrorOf(e, TypeError)))
            throw e;
    }
    return defaultValue;
}


export function isErrorOf(e: any, errorCtor: (...args: []) => any) {
    return e instanceof errorCtor || e.constructor === errorCtor || e.name === errorCtor.name;
}

export function ensureArray<T>(v: T | T[]): T[] {
    return isArray(v) ? v : isDefined(v) ? [ v ] : [];
}


export function ensurePromise<T>(v: T | Promise<T>): Promise<T> {
    return isPromise(v) ? v : Promise.resolve(v);
}



export const entries = <T extends ObjectOf<any>>(o: T) => Object.entries(o) as [ keyof T, T[ keyof T ] ][];
export const keys = <T extends ObjectOf<any>>(o: T) => Object.keys(o) as [ keyof T ];
export const values = <T extends ObjectOf<any>>(o: T) => Object.values(o) as T[ keyof T ];

export const fromKey = <O extends ObjectOf<any>>(array: O[] | Readonly<O[]>, key: keyof O, value: O[ keyof O ]): O => array.find(el => el[ key ] === value);

export const toObject = <O extends ObjectOf<any>, K extends keyof O>(array: O[] | Readonly<O[]>, key: K): { [ key in O[ K ] ]: O } =>
    array.reduce((o, curr) => ({ ...o, [ curr[ key ] ]: curr }), {} as any) as any;


export const removeUndefined = <O extends ObjectOf<any>>(o: O) => Object.fromEntries(Object.entries(o).filter(([ _, v ]) => typeof v !== 'undefined'));

// props = a.b.c.d for instance
// getRecursive(o, props) => get o.a.b.c.d
// if prop does not exist, return undefined
export const getRecursive = <O extends object>(o: O, props: string) => props.split('.').reduce((obj, p) => obj[ p ] || {}, o);

// setRecursive(o, props, value) sets o.a.b.c.d = value
// if a prop does not exist, it is created as {}
export const setRecursive = <O extends object>(o: O, props: string, value: any) => props.split('.').reduce((obj, p, i, arr) => {
    return obj[ p ] = i === arr.length - 1 ? value : obj[ p ] || {};
}, o);

export const dottedKeys = (o: object): string[] => Object.entries(o).map(([ k, v ]) => isPlainObject(v) ? `${k}.${dottedKeys(v)}` : k);


// create object from keys
// makeObject([ 'a', 'b', 'c' ], k => `value: ${k}`);
// makeObject({ a: 1, b: 2, c: 3 }, k => `value: ${k}`);
// makeObject(class { a: 1; b: 2; c: 3; }, k => `value: ${k}`);
// gives the same result => { a: 'value a', b: 'value b', c: 'value c' };

export function makeObject<Klass extends Constructor, V extends (key: keyof InstanceType<Klass>) => any>(klass: Klass, value: V): Record<keyof InstanceType<Klass>, ReturnType<V>>;
export function makeObject<O extends {}, V extends (key: keyof O) => any>(obj: O, value: V): Record<keyof O, ReturnType<V>>;
export function makeObject<Keys extends Array<Prop>, V extends (key: Keys[ number ]) => any>(k: Keys, value: V): Record<Keys[ number ], ReturnType<V>>;

export function makeObject(arg: Prop[] | object | Constructor, value: (k: Prop) => any): object {
    const keys = Array.isArray(arg) ? arg : Object.keys(arg.constructor ? new (arg as Constructor)() : arg);

    return keys.reduce((o, k) => {
        o[ k ] = value(k);
        return o;
    }, {} as any);
}
