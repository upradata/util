import { isArray, isDefined, isPromise } from './is';
import { ObjectOf } from './type';

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


type StringType = { toString(): string; };
export type StringTemplateTranformer = (strings: TemplateStringsArray, ...keys: StringType[]) => string;

export function sPipe(...transformers: StringTemplateTranformer[]) {
    return (strings: TemplateStringsArray, ...keys: StringType[]) => {
        let s: string = transformers[ 0 ](strings, ...keys);

        for (const transformer of transformers.slice(1)) {
            s = transformer`${s}`;
        }

        return s;
    };
}


export const entries = <T extends ObjectOf<any>>(o: T) => Object.entries(o) as [ keyof T, T[ keyof T ] ][];
