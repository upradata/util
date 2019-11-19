declare var ENVIRONMENT: 'browser' | 'node';

type Random = <T extends Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView>(array: T) => T;

let random: Random = undefined;

if (typeof ENVIRONMENT !== 'undefined' && ENVIRONMENT === 'browser')
    random = crypto.getRandomValues.bind(crypto);
else {
    // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    const isBrowser = typeof window !== 'undefined';
    random = isBrowser ? crypto.getRandomValues.bind(crypto) : require('crypto').randomFillSync.bind(require('crypto'));
}

// const random = isBrowser ? crypto.getRandomValues : require('crypto').randomFillSync;

export function guid() {
    return ([ 1e7 ] as any + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ random(new Uint8Array(1))[ 0 ] & 15 >> c / 4).toString(16)
    );
}
