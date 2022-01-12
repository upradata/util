import type { TT$ } from './type';
import { arrayN } from './useful';


export type ChainedFunc<T> = (value: T, i?: number) => TT$<T>;

export const chained$ = <T>(functions: ChainedFunc<T>[], init: T = undefined): Promise<T> => {
    return functions.reduce((current, func, i) => current.then(v => func(v, i)), Promise.resolve(init));
};

export const repeatChained$ = <T>(func: ChainedFunc<T>, n: number, init: T = undefined): Promise<T> => {
    return chained$(arrayN(n).map(_i => func), init);
};

export const chainedArr$ = <T, R>(array: T[], func: (arrayValue: T, reducerValue?: R, i?: number) => TT$<R>, init: R = undefined): Promise<R> => {
    return chained$(array.map(v => (r, i) => func(v, r, i)), init);
};


export const delayedPromise = <T>() => {
    let resolve: (value: T | PromiseLike<T>) => void = undefined;
    let reject: (reason?: any) => void = undefined;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
};



export type CallTimeoutOptions = { ms?: number; waitPromise?: boolean; };
export const callTimeout = <R, O extends CallTimeoutOptions>(func: () => R, options: O): O[ 'waitPromise' ] extends true ? R : Promise<R> => {
    const { ms, waitPromise } = options;

    return new Promise<R | Promise<R>>((resolve, _rej) => {
        setTimeout(() => {
            const r = func();

            if (r instanceof Promise && waitPromise)
                return r.then(resolve);

            return resolve(r);
        }, ms);
    }) as any;
};
