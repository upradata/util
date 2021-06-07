import { AssignOptions, assignRecursive } from './assign';
import { isArray, isDefined, isDefinedProp, isPromise } from './is';
import { Key, InferArrayType, Arr, TT, FF, AnyFunction } from './type';

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

export function ensureArray<T extends TT<any>>(v: T): T extends Arr<any> ? T : T[] {
    return (isArray(v) ? v : isDefined(v) ? [ v ] : []) as any;
}

export function ensurePromise<T>(v: T | Promise<T>): Promise<T> {
    return isPromise(v) ? v : Promise.resolve(v);
}

export function ensureFunction<T>(v: T): T extends (...args: any[]) => any ? T : never {
    return typeof v === 'function' ? v as any : (...args: any[]) => v;
}

/* type F = ((data: number) => string) | string;
const f: F = 'test';

const ff = ensureFunction(f as F); */

export const arrayN = (n: number) => Array(n).fill(0);

export const repeatChained = <T>(func: (value: T, i?: number) => T, n: number, init: T): T => {
    return arrayN(n).map(i => func).reduce((lastReturn, f, i) => f(lastReturn, i), init);
};


export type Next<D, N> = (data: D) => N;

export const pipeline = <D>(data: D) => ({
    pipe: <N>(next: Next<D, N>) => {
        const ret = next(data);
        return { pipe: pipeline(ret).pipe, value: ret };
    }
});

export const composeLeft = <FN extends (...args: any[]) => any, V extends ReturnType<FN> = ReturnType<FN>, R = ReturnType<FN>>(functions: FN[], value: V): R => {
    return functions.reduce((current: ReturnType<FN>, fn) => fn(current), value);
};

export const compose = <FN extends (...args: any[]) => any, V extends ReturnType<FN> = ReturnType<FN>, R = ReturnType<FN>>(functions: FN[], value: V): R => {
    return composeLeft(functions.reverse(), value);
};

export const composeRight = compose;



/* export type ReturnSelector<V> = { if: boolean, value: V; };
export type Selector<D, V> = (data: D) => ReturnSelector<V>; */

export type ReturnIfSelector<T, E, N> = { if?: FF<boolean>, then: T; else?: E; next?: N; functionToCall?: boolean; };
export type IfSelector<T, E, N, D> = ((data?: D) => ReturnIfSelector<T, E, N>) | ReturnIfSelector<T, E, N>;


export const ifChained = <D = never, F = never>(data: D = undefined, finalValue: F = undefined, done: boolean = false) => ({
    next: <T, E = never, N = never>(selector: IfSelector<T, E, N, D>) => {
        // for TS typing, we are obliged to return in one place only
        // otherwise, TS will give the return type of next the "any" type
        let value: F | T | E = undefined;
        let nextData: N = undefined;
        let isDone: boolean = undefined;

        if (done) {
            value = finalValue;
            nextData = data as any as N;
            isDone = true;
        } else {

            const select = ensureFunction(selector)(data);

            const iff = ensureFunction(select.if)();
            const then = select.functionToCall ? ensureFunction(select.then)() : select.then;
            const elsee = isDefinedProp(select, 'else') ? select.functionToCall ? ensureFunction(select.else)() : select.else : undefined;

            value = iff ? then : elsee;
            nextData = isDefinedProp(select, 'next') ? select.next : data as any as N;
            isDone = iff || isDefinedProp(select, 'else');
        }

        return { next: ifChained(nextData, value, isDone).next, value };
    }
});

export const ifThen = ifChained;

/* const valueIf = ifChained()
    .next(() => ({ if: 'caca' === 'caCa', then: 'caca' }))
    .next({ if: 1 === 1, then: true })
    .next({ if: 1 === 1, then: [ 1, 2, 3 ], else: 'default' })
    .value;

const valueIf2 = ifChained('test' as const)
    .next(arg => ({ if: arg === 'test', then: 123, next: 456 as const }))
    .next(arg => ({ if: arg + 1 === 457, then: true }))
    .next({ if: 1 === 1, then: [ 1, 2, 3 ], else: 'default' })
    .value;
 */



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

        return !!value ? value : first(tail);
    };

    return first(array);
};

firstTruthy([ false, undefined, 1, 2 ]) === 1;
firstTruthy([ false, undefined, () => 'bonjour', 2 ]) === 'bonjour';


export const arrayFromIterable = <T>(it: Iterable<T>): T[] => Array.isArray(it) ? it : [ ...it ];


export const deepCopy = <O extends {}>(o: O, options?: AssignOptions) => assignRecursive({}, o, options);
