declare var ENVIRONMENT: 'browser' | 'node';

export type Random = <T extends Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView>(array: T) => T;

export let random: Random = undefined;

if (typeof ENVIRONMENT !== 'undefined' && ENVIRONMENT === 'browser')
    random = crypto.getRandomValues.bind(crypto);
else {
    // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    const isBrowser = typeof window !== 'undefined';
    random = isBrowser ? crypto.getRandomValues.bind(crypto) : require('crypto').randomFillSync.bind(require('crypto'));
}

// const random = isBrowser ? crypto.getRandomValues : require('crypto').randomFillSync;
