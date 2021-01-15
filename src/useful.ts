import { isArray, isDefined, isPromise } from './is';

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
