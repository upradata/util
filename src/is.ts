import { isUndefined, isNull } from 'ts-util-is';

export * from 'ts-util-is';

export function isArray<T>(value: any): value is T[] {
    return Array.isArray(value);
}

export function isDefined(o: any) {
    return !isUndefined(o);
}


// MDN Polyfill
export function isInt(n: number) {
    return typeof n === 'number' &&
        isFinite(n) &&
        Math.floor(n) === n;
}



export function isFloat(n: number) {
    return !isInt(n);
}

export function isNil(value: any) {
    return isNull(value) || isUndefined(value);
}

export function isAsyncFunction(value: any) {
    return Object.prototype.toString.call(value) === '[object AsyncFunction]';
}
