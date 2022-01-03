import type { Arr } from './type';


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
