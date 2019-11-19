export * from './assign';
export * from './is';
export * from './boolean-attribute';
export * from './observable-subscribe-once';
export * from './guid';
export * from './execute-temporary-state';

// export * from './node-util';
// export * from './path-normalize';


// chain(() => o.a.b.c) ==> if a prop doesn't exist ==> return defaultValue
export function chain<T>(exp: () => T, defaultValue: T = undefined) {
    try {
        /* const val = exp();
        if (val != null) {
            return val;
        } */
        return exp();
    } catch (e) {
        if (!(e instanceof ReferenceError || e instanceof TypeError))
            throw e;
    }
    return defaultValue;
}
