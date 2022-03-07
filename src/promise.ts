import type { TT$ } from './types';
import { arrayN } from './useful';


export type ChainedFunc<T> = (value: T, i?: number) => TT$<T>;

export const chained$ = <T>(functions: ChainedFunc<T>[], init: T = undefined): Promise<T> => {
    return functions.reduce((current, func, i) => current.then(v => func(v, i)), Promise.resolve(init));
};

export const composed$ = chained$;

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

export const callTimeout = <R, O extends CallTimeoutOptions>(func: () => R, options?: O): Promise<Awaited<R>> => {
    const { ms = 0, waitPromise = true } = options || {};

    return new Promise<R | Promise<R>>((resolve, _rej) => {
        setTimeout(() => {
            const r = func();

            if (r instanceof Promise && waitPromise)
                return r.then(resolve);

            return resolve(r);
        }, ms);
    }) as any;
};


/* export const compose$ = <FN extends (arg: any) => TT$<any>, V extends Parameters<FN>[ 0 ] = Parameters<FN>[ 0 ], R = ReturnType<FN>>(functions: FN[], value: V): Promise<Awaited<R>> => {
    return composeLeft(functions.map(f => async (...args: any[]) => {
        if (args.length === 1 && args[ 0 ] instanceof Promise)
            return f(await args[ 0 ]);

        return f.apply(null, args);
    }), value);
}; */

/* console.time('chrono');

compose$([
    (n: number) => callTimeout(() => { console.timeEnd('chrono'); console.time('chrono'); return n + 1; }, { ms: 100 }),
    (n: number) => callTimeout(() => { console.timeEnd('chrono'); console.time('chrono'); return n + 1; }, { ms: 1000 }),
    (n: number) => callTimeout(() => { console.timeEnd('chrono'); console.time('chrono'); return n + 1; }, { ms: 100 }),
    (n: number) => { console.timeEnd('chrono'); return n + 1; },
], 1).then(n => console.log(n));
 */
