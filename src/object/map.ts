/* eslint-disable no-redeclare */
import { Constructor, AnyFunction } from '../function';
import { ValueOf, Arr, Key } from '../types';


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

        // r can be undefined | null !!
        const key = r?.key || k;
        const v = r?.key ? r.value : r;

        o[ key ] = v;
        return o;
    }, {} as any);
}

export const map = makeObject;
