// export * from 'ts-util-is';
// export * is not support by rollup with commonjs :(((
export {
    isArray, isBase64, isBoolean, isDate, isDateValid, isDefined, isError, isFunction, isGuid, isInfinity, isNull, isNumber, isObject, isPlainObject, isRegExp, isString, isSymbol, isUndefined
} from './node-modules-esm/ts-util-is';

import { isUndefined, isNull, isDefined } from './node-modules-esm/ts-util-is';


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

export function isPromise<T>(v: T | Promise<T>): v is Promise<T> {
    return isDefined(v) && (v instanceof Promise || isDefined((v as any).then));
}


export function isDefinedProp<T extends {} | any[]>(o: T, k: keyof T) {
    return k in o;
}
