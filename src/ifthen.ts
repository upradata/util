import { isDefinedProp } from './is';
import { ensureFunction } from './useful';
import type { TT$ } from './types';

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


export type IfChainedNext<D, V = never, Done extends boolean = false> = {
    next: Done extends true ?
    never :
    <S extends IfChainedSelector<D>>(selector: S) => IfChainedNext<
        [ ExtractS<S, 'next'> ] extends [ never ] ? D : ExtractS<S, 'next'>,
        V | ExtractS<S, 'then'> | ExtractS<S, 'else'>,
        Done extends true ? Done : S extends { else: any; } ? true : false
    >;
    value: V;
};

export type IfChained = <D>(data?: D) => {
    next: <S extends IfChainedSelector<D>>(selector: S) => IfChainedNext<
        D,
        ExtractS<S, 'then'> | ExtractS<S, 'else'>,
        S extends { else: any; } ? true : false
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


/* const v1 = ifThen('test').next({ if: false, then: 11 }).next({ if: false, then: '11' }).value;

const v2 = ifThen('test').next({ if: false, then: 11, else: 22 }).next({ if: false, then: '11' }).value;
const v22 = ifThen('test').next({ if: false, then: 11, else: 22 }).value;

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


type Condition<T, E> = { if?: TT$<boolean>; then: T | CallableValue<T>; else?: E | CallableValue<E>; };
export const ifthen = <C extends Condition<any, any>>(condition: C) => {
    return ifThen().next(condition).value;
};
