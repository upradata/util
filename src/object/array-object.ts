import { RecordOf, InferRecordType, Key } from '../types';
import { arrayFromIterable } from '../useful';



// toObject([ { key: 'a' as const, v: 1 }, { key: 'b' as const, v: 2 } ], 'key', 'value') => { a: { key: 'a', v: 1 }, b: { key: 'b', v: 2 } };
// toObject([ { key: 'a', v: 1 }, { key: 'b', v: 2 }, { key: 'a', v: 3 } ], 'key', 'array') => { a: [ { key: 'a', v: 1 }, { key: 'a', v: 3 } ], b: [ { key: 'b', v: 2 } ] };


// eslint-disable-next-line max-len
// export const toObject = <O extends RecordOf<any>, K extends keyof O, M extends 'value' | 'array' = 'array'>(array: O[] | Readonly<O[]>, key: K, mode: M = 'value' as M): { [ /// Key in O[ K ] ]: M extends 'value' ? O : O[] } => {
export const toObject = <O extends RecordOf<any>, K extends keyof O, M extends 'value' | 'array' = 'value'>(
    it: Iterable<O>, key: K, mode: M = 'value' as M
): { [ Key in O[ K ] ]: M extends 'value' ? O : O[] } => {
    return arrayFromIterable(it).reduce((o, curr) => {
        const k = curr[ key ];
        o[ k ] = mode === 'value' ? curr : [ ...(o[ k ] || []), curr ] as any;

        return o;
        // return { ...o, [ k ]: mode === 'value' ? curr : [ ...(o[ k ] || []), curr ] };
    }, {} as any) as any;
};

// toArray({ a: { k1: 1, k2: 2 }, b: { k1: 3, k2: 4 } }, 'key') => [ { key: 'a', k1: 1, k2: 2 }, { key: 'b', k1: 3, k2: 4 } ]
// toArray({ a: { k1: 1, k2: 2 }, b: { k1: 3, k2: 4 } }, undefined) => [ { k1: 1, k2: 2 }, { k1: 3, k2: 4 } ]
type ToArrayValue<T> = InferRecordType<T> extends {} ? InferRecordType<T> : { value: T; };
type ToArrayReturn<T, OnlyValues extends boolean, Extra = {}> = OnlyValues extends true ? ToArrayValue<T> : ToArrayValue<T> & Extra;
type KeyOf<T> = InferRecordType<T> extends {} ? keyof T : T;

export class ToArrayOptions<T extends {}> {
    onlyValues?: boolean = false;
    filter?: (key: keyof T, value?: T[ keyof T ]) => boolean = (_k, _v) => true;
    keyName?: Key = 'key';
}


// export function toArray<T extends {}, O extends ToArrayOptions>(o: T, options?: O): ToArrayReturn<O, O[ 'onlyValues' ] extends true ? {} : { key: KeyOf<O>; }>[] {
// export function toArray<O extends {}, K extends Key = 'key'>(o: O, keyName?: K): ToArrayReturn<O, { [ k in K ]: KeyOf<O> }>[];
// export function toArray<O>(o: O, keyName?: Key): O[] {

type ToArrayKey<O extends ToArrayOptions<any>> = O extends never ? 'key' : O[ 'keyName' ];

export function toArray<T extends {}, O extends ToArrayOptions<T>>(o: T, options?: Partial<O>): ToArrayReturn<T, O[ 'onlyValues' ], { [ P in ToArrayKey<O> ]: KeyOf<T> }>[] {

    const { onlyValues, filter, keyName } = Object.assign(new ToArrayOptions(), options) as ToArrayOptions<any>;

    return Object.entries(o).filter(([ k, v ]) => filter(k, v)).map(([ k, v ]) => {
        if (onlyValues)
            return v as any;

        const value = typeof v === 'object' ? v : { value: v };
        return { [ keyName ]: k, ...value };
    });
}


/* const a = toArray({ a: { k1: 1, k2: 2 }, b: { k1: 3, k2: 4 } } as const, { keyName: 'id', filter: (k, v) => k === 'a' });
const b = toArray({ a: { k1: 1, k2: 2 }, b: { k1: 3, k2: 4 } } as const, { keyName: 'id' });
const c = toArray({ a: { k1: 1, k2: 2 }, b: { k1: 3, k2: 4 } } as const, { keyName: 'id', onlyValues: true });
const d = toArray({ a: { k1: 1, k2: 2 }, b: { k1: 3, k2: 4 } } as const);
const e = toArray({ a: 1, b: { k1: 3, k2: 4 } } as const);
const f = toArray({ a: 1, b: { k1: 3, k2: 4 } } as const, { onlyValues: true });

console.log(a, b, c, d, e, f);
debugger; */
