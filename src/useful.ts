import { isArray, isDefined, isDefinedProp, isPromise } from './is';
import { PickType, Key, ExcludeKeysType, InferArrayType, PickType2, Arr, Function0 } from './type';

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

export const compose = <FN extends (...args: any[]) => any, V extends ReturnType<FN> = ReturnType<FN>, R = ReturnType<FN>>(functions: FN[], value: V): R => {
    return functions.reverse().reduce((current: ReturnType<FN>, fn) => fn(current), value);
};


/* export type ReturnSelector<V> = { if: boolean, value: V; };
export type Selector<D, V> = (data: D) => ReturnSelector<V>; */

export type ReturnIfSelector<T, E, N> = { if?: boolean, then: T; else?: E; next?: N; };
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

            const select = typeof selector === 'function' ? selector(data) : selector;

            const then = select.then;
            const elsee = select.else;

            value = select.if ? then : isDefinedProp(select, 'else') ? elsee : undefined;
            nextData = isDefinedProp(select, 'next') ? select.next : data as any as N;
            isDone = select.if || isDefinedProp(select, 'else');
        }

        return { next: ifChained(nextData, value, isDone).next, value };
    }
});

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

/* export type ReturnSelector<V> = { if: boolean, value: V; };
export type Selector<D, V> = (data: D) => ReturnSelector<V>;

export const select = <D, F = never>(data: D, finalValue: F = undefined, done: boolean = false) => ({
    next: <V>(selector: Selector<D, V>) => {

        if (done) {
            const value = finalValue as F | V;
            return { next: select(data, value, true).next, value };
        }

        const { if: iff, value } = selector(data);

        return { next: select(data, value as F | V, iff).next, value: value as F | V };
    }
}); */


/* const value = select('caca')
    .next(data => ({ if: data === 'caCa', value: data }))
    .next(data => ({ if: 1 === 1, value: true }))
    .next(data => ({ if: 1 === 1, value: [ 1, 2, 3 ] }))
    .value; */


export const filterByType = <A extends Arr<any>, T extends InferArrayType<A>, V extends T[ K ], K extends Key = 'type'>(array: A, value: V, key: K = 'type' as any):
    T extends { [ k in K ]: V } ? T[] : never => {
    return array.filter(v => v[ key ] === value) as any;
};

/* const a = filterByType([ { type: 'a', v: 1 }, { type: 'b', v: 2 }, { type: 'a', v: 11 }, { type: 'a', v: 111 }, { type: 'c', v: 3 } ] as const, 'a' as const);
const a0 = a[ 0 ];
a0.type === 'a';
a0.v === 11;

const b = filterByType([ { type: 'a', v: 1 }, { type: 'b', v: 2 }, { type: 'a', v: 11 }, { type: 'a', v: 111 }, { type: 'c', v: 3 } ], 'a');
 */


export const firstTruthy = (...array: Array<any | Function0>): boolean => {
    if (array.length === 0)
        return false;

    const [ head, ...tail ] = array;

    const isHeadFunction = typeof head === 'function' && head.length === 0;
    const value = isHeadFunction ? head() : head;

    return value ? true : firstTruthy(...tail);
};
