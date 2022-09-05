import type { Constructor } from './function';
import { isArray, isDefined, isPromise } from './is';
import type { Key, InferArrayType, Arr, TT$ } from './types';

// chain(() => o.a.b.c) ==> if a prop doesn't exist ==> return defaultValue
// Now it is not necessary anymore with o?.a syntax
export function chain<T>(exp: () => T, defaultValue: T = undefined) {
    try {
        return exp();
    } catch (e) {
        if (!(isErrorOf(e, ReferenceError) || isErrorOf(e, TypeError)))
            throw e;
    }
    return defaultValue;
}


export function isErrorOf(e: any, errorCtor: Constructor) {
    return e instanceof errorCtor || e.constructor === errorCtor || e.name === errorCtor.name;
}

/* export function ensureArray<T extends TT<any>>(v: T): T extends Arr<any> ? T : T[] {
    return (isArray(v) ? v : isDefined(v) ? [ v ] : []) as any;
} */

export function ensureArray<T>(v: T): T extends Arr<any, 'readonly'> ? T : T[] {
    return (isArray(v) ? v : isDefined(v) ? [ v ] : []) as any;
}

export function ensurePromise<T>(v: T | Promise<T>): Promise<T> {
    return isPromise(v) ? v : Promise.resolve(v);
}

export function ensureFunction<T>(v: T): T extends (...args: any[]) => any ? T : never {
    return typeof v === 'function' ? v as any : (..._args: any[]) => v;
}

/* type F = ((data: number) => string) | string;
const f: F = 'test';

const ff = ensureFunction(f as F); */

type Filler<T> = (i: number) => T;
export const arrayN = <T = any>(n: number, fill: T | Filler<T> = undefined): T[] => {
    const filler: Filler<T> = typeof fill === 'function' ? fill as Filler<T> : _i => fill;

    const create = (array: T[], i: number): T[] => {
        if (i === n)
            return array;

        return create([ ...array, filler(i) ], i + 1);
    };

    return create([], 0);
};




export const filterByKey = <A extends Arr<any>, T extends InferArrayType<A>, V extends T[ K ], K extends Key = 'type'>(array: A, value: V, key: K = 'key' as any):
    T extends { [ k in K ]: V } ? T[] : never => {
    return array.filter(v => v[ key ] === value) as any;
};

/* const a = filterByKey([ { type: 'a', v: 1 }, { type: 'b', v: 2 }, { type: 'a', v: 11 }, { type: 'a', v: 111 }, { type: 'c', v: 3 } ] as const, 'a' as const, 'type');
const a0 = a[ 0 ];
a0.type === 'a';
a0.v === 11;

const b = filterByKey([ { type: 'a', v: 1 }, { type: 'b', v: 2 }, { type: 'a', v: 11 }, { type: 'a', v: 111 }, { type: 'c', v: 3 } ], 'a', 'type');
 */


export const firstTruthy = <T>(...array: Array<T>): any => {
    const isFunction = (v: any): v is Function => typeof v === 'function' && v.length === 0;

    const first = (array: Array<T>): any => {
        if (array.length === 0)
            return false;

        const [ head, ...tail ] = array;

        const value = isFunction(head) ? head() : head;

        // eslint-disable-next-line no-extra-boolean-cast
        return !!value ? value : first(tail);
    };

    return first(array);
};

/* firstTruthy([ false, undefined, 1, 2 ]) === 1;
firstTruthy([ false, undefined, () => 'bonjour', 2 ]) === 'bonjour'; */


export const arrayFromIterable = <T>(it: Iterable<T>): T[] => Array.isArray(it) ? it : [ ...it ];


export interface PollOptions {
    duration: number;
    timeStep?: number;
}


export const poll = <S, E>(handler: () => TT$<{ stop: boolean; error?: E; success?: S; }>, options: PollOptions) => {
    const { duration, timeStep = 100 } = options;
    let totalWait = 0;

    return new Promise<S>((res, rej) => {
        const id = setInterval(async () => {
            const { error, success, stop } = await handler();

            if (stop) {
                res(success);
                clearInterval(id);
            } else if (totalWait > duration) {
                rej(error);
                clearInterval(id);
            }

            totalWait += timeStep;
        }, timeStep);
    });
};
