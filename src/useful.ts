import { AssignOptions, assignRecursive } from './assign';
import { Constructor } from './function';
import { isArray, isDefined, isDefinedProp, isPromise } from './is';
import { Key, InferArrayType, Arr, TT, FF, TT$, NotDefined } from './type';

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



type IfChainedValue<D, V> = V | ((data?: D) => V);
type IfChainedCondition<D> = IfChainedValue<D, TT$<boolean>>;
type CallableValue<T> = { callable: () => T; };
type Selector<D, T = any, E = any, N = any> = { if?: IfChainedCondition<D>; then: T | CallableValue<T>; else?: E | CallableValue<E>; next?: N; };
type IfChainedSelector<D, T = any, E = any, N = any> = IfChainedValue<D, Selector<D, T, E, N>>;


type Ex<S extends Selector<any>, K> = K extends keyof S ?
    K extends 'then' ? S[ K ] extends CallableValue<any> ? ReturnType<S[ K ][ 'callable' ]> : S[ K ] :
    K extends 'else' ? S[ K ] extends CallableValue<any> ? ReturnType<S[ K ][ 'callable' ]> : S[ K ] :
    S[ K ] :
    never;

type ExtractS<S extends IfChainedSelector<any>, K extends keyof Selector<any>> = S extends (...args: any) => any ?
    Ex<ReturnType<S>, K> :
    S extends Selector<any> ? Ex<S, K> : never;


export type IfChainedNext<D, V = never> = {
    next: <S extends IfChainedSelector<D>>(selector: S) => IfChainedNext<
        [ ExtractS<S, 'next'> ] extends [ never ] ? D : ExtractS<S, 'next'>,
        V | ExtractS<S, 'then'> | ExtractS<S, 'else'>
    >;
    value: V;
};

export type IfChained = <D>(data?: D) => {
    next: <S extends IfChainedSelector<D>>(selector: S) => IfChainedNext<D,
        ExtractS<S, 'then'> | ExtractS<S, 'else'>
    >;
};


const _ifChained = <D = never>(data: D = undefined) => {
    const isCallable = <T>(v: T | CallableValue<T>): v is CallableValue<T> => typeof v === 'object' && 'callable' in v;

    const _if = <D, F>(data: D = undefined, finalValue: F = undefined, done: boolean = false) => ({
        next: <T, E = never, N = never>(selector: IfChainedSelector<D, T, E, N>) => {
            // for TS typing, we are obliged to return in one place only
            // otherwise, TS will give the return type of next the "any" type
            /* let value: F | T | E = undefined;
            let nextData: N = undefined;
            let isDone: boolean = undefined; */

            if (done)
                return { next: _if(data, finalValue, true).next, value: finalValue };


            const select = ensureFunction(selector)(data);

            const iff = isDefinedProp(select, 'if') ? ensureFunction(select.if)(data) : true;
            const then = isCallable(select.then) ? select.then.callable() : select.then;
            const elsee = isCallable(select.else) ? select.else.callable() : select.else;

            const processIfValue = (ifValue: boolean) => {
                const value = ifValue ? then : elsee;
                const nextData = isDefinedProp(select, 'next') ? select.next : data as any as N;
                const isDone = ifValue || isDefinedProp(select, 'else');

                return { next: _if(nextData, value, isDone).next, value };
            };

            return iff instanceof Promise ? iff.then(processIfValue) : processIfValue(iff);
        }
    });

    return _if(data);
};


export const ifChained = _ifChained as any as IfChained;
export const ifThen = ifChained;


/* const v2 = ifThen('test').next({ if: false, then: 11 }).next({ if: false, then: '11' }).value;

const v3 = ifThen('test').next({ if: s => s === 'test', then: 11 }).next(s => ({ if: s === 'mm', then: '11' })).value;

const v4 = ifThen('test').next({ if: Promise.resolve(true), then: 11 }).next(s => ({ if: Promise.resolve(s === 'mm'), then: '11' })).value;

const v5 = ifThen('test').next({ if: false, then: { callable: () => 11 } }).next(s => ({ if: s === 'tes', then: '11', next: 23 })).next(s => ({ if: s === 10, then: '11' })).value;

 */

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

        // eslint-disable-next-line no-extra-boolean-cast
        return !!value ? value : first(tail);
    };

    return first(array);
};

/* firstTruthy([ false, undefined, 1, 2 ]) === 1;
firstTruthy([ false, undefined, () => 'bonjour', 2 ]) === 'bonjour'; */


export const arrayFromIterable = <T>(it: Iterable<T>): T[] => Array.isArray(it) ? it : [ ...it ];


export const deepCopy = <O extends object>(o: O, options?: AssignOptions) => assignRecursive({}, o, options);
