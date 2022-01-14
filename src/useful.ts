import { AssignOptions, assignRecursive } from './assign';
import type { Constructor, FunctionN } from './function';
import { isArray, isDefined, isPromise } from './is';
import type { Key, InferArrayType, Arr, TT } from './types';

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

export function ensureArray<T extends TT<any>>(v: T): T extends Arr<any> ? T : T[] {
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

export const arrayN = <T = any>(n: number, fill: T = undefined): T[] => Array(n).fill(fill);



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


export const deepCopy = <O extends {}>(o: O, options?: AssignOptions): O => assignRecursive({}, o, options) as O;




export const partialHeadCall = <T extends Arr, U extends Arr, R>(f: FunctionN<[ ...T, ...U ], R>, ...headArgs: T): FunctionN<U, R> => {
    return (...tailArgs: U) => f(...headArgs, ...tailArgs);
};


export const partialTailCall = <T extends Arr, U extends Arr, R>(f: FunctionN<[ ...T, ...U ], R>, ...tailArgs: U): FunctionN<T, R> => {
    return (...headArgs: T) => f(...headArgs, ...tailArgs);
};


export const bind = <T extends Arr<unknown, 'readonly'>, U extends Arr<unknown, 'readonly'>, R>(
    f: FunctionN<[ ...T, ...U ], R>,
    thisArg: unknown,
    ...headArgs: T): FunctionN<U, R> => {
    return partialHeadCall(f.bind(thisArg), ...headArgs);
};

/*
const f = function (a: number, b: string): string {
    return `${a}${b}`;
};


const partialHead = partialHeadCall(f, 1);
partialHead('2');

const partialTail = partialTailCall(f, '2'); // typing not working => MUST open an ISSUE on github
partialTail(1);

const fBound = bind(f, { thisA: 1 });
fBound(1, '2');

const fBound2 = bind(f, { thisA: 1 }, 1);
fBound2('2');
 */



export const repeatChained = <T>(func: (value: T, i?: number) => T, n: number, init: T): T => {
    return arrayN(n).map(_i => func).reduce((lastReturn, f, i) => f(lastReturn, i), init);
};


export type PipelineNext<D, N> = (data: D) => N;

export const pipeline = <D>(data: D) => ({
    pipe: <N>(next: PipelineNext<D, N>) => {
        const ret = next(data);
        return { pipe: pipeline(ret).pipe, value: ret };
    }
});

export const composeLeft = <FN extends (arg: any) => any, V extends Parameters<FN>[ 0 ] = ReturnType<FN>, R = ReturnType<FN>>(functions: FN[], value: V): R => {
    return functions.reduce((current: ReturnType<FN>, fn) => fn(current), value);
};

export const compose = <FN extends (arg: any) => any, V extends Parameters<FN>[ 0 ] = ReturnType<FN>, R = ReturnType<FN>>(functions: FN[], value: V): R => {
    return composeLeft(functions.reverse(), value);
};

export const composeRight = compose;
