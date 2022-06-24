import type { Arr } from './types';
import { arrayN } from './useful';


export type Function0<R = any> = () => R;
export type Function1<Arg1, R = unknown> = (arg1: Arg1) => R;
export type Function2<Arg1, Arg2, R = unknown> = (arg1: Arg1, arg2: Arg2) => R;
export type Function3<Arg1, Arg2, Arg3, R = unknown> = (arg1: Arg1, arg2: Arg2, arg3: Arg3) => R;
export type Function4<Arg1, Arg2, Arg3, Arg4, R = unknown> = (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4) => R;
export type Function5<Arg1, Arg2, Arg3, Arg4, Arg5, R = unknown> = (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5) => R;
export type FunctionN<T extends Arr, R = unknown> = (...args: T) => R;
export type AnyFunction<R = unknown> = FunctionN<Arr, R>;



export type Constructor0<R = object> = new () => R;
export type Constructor1<P1, R = object> = new (p1: P1) => R;
export type Constructor2<P1, P2, R = object> = new (p1: P1, p2: P2) => R;
export type Constructor3<P1, P2, P3, R = object> = new (p1: P1, p2: P2, p3: P3) => R;
export type Constructor4<P1, P2, P3, P4, R = object> = new (p1: P1, p2: P2, p3: P3, p4: P4) => R;
export type Constructor5<P1, P2, P3, P4, P5, R = object> = new (p1: P1, p2: P2, p3: P3, p4: P4, p5: P5) => R;
export type Constructor<T extends Arr = unknown[], R = object> = new (...args: T) => R;
export type AnyConstructor<T extends Arr = unknown[], R = object> = Constructor<T, R>;



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

export const composeLeft = <FN extends (arg: any) => any, V extends Parameters<FN>[ 0 ] = Parameters<FN>[ 0 ], R = ReturnType<FN>>(functions: FN[], value: V): R => {
    return functions.reduce((current: ReturnType<FN>, fn) => fn(current), value);
};

export const compose = <FN extends (arg: any) => any, V extends Parameters<FN>[ 0 ] = Parameters<FN>[ 0 ], R = ReturnType<FN>>(functions: FN[], value: V): R => {
    return composeLeft(functions.reverse(), value);
};

export const composeRight = compose;
