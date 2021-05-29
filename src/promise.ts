import { TT$ } from './type';
import { arrayN } from './useful';


export const chained$ = <T>(promises: Array<(value: T, i?: number) => TT$<T>>, init: T): Promise<T> => {
    return promises.reduce((current, promise, i) => current.then(v => promise(v, i)), Promise.resolve(init));
};

export const repeatChained$ = <T>(func: (value: T, i?: number) => TT$<T>, n: number, init: T): Promise<T> => {
    return chained$(arrayN(n).map(i => func), init);
};


export const delayedPromise = <T>() => {
    let resolve: (value: T | PromiseLike<T>) => void = undefined;
    let reject: (reason?: any) => void= undefined;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
};
