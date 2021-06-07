
import { ValueOf, Key } from '../type';
import { isDefined, isPlainObject } from '../is';
import { entries } from './access';


export type PrimitiveRecursive<T> = {
    [ K in keyof T ]: T[ K ] extends object ? PrimitiveRecursive<T[ K ]> : T[ K ]
}[ keyof T ];


export type KeysRecursive<T> = keyof T | {
    [ K in keyof T ]: T[ K ] extends object ? KeysRecursive<T[ K ]> : never
}[ keyof T ];

/*
type A = {
    a: number;
    b: { b1: number; b2: { c1: string; }; };
};

const a: KeysRecursive<A> = 'a' || 'b' || 'b1' || 'b2' || 'c1';
PrimitiveRecursive<A> === string | number;
*/

type Concatanable = string | number | bigint;

type ExtractConcatanable<T> = Extract<T, Concatanable>; // or keyof T & string works also

type Concat<A, B> = B extends '' ? A : `${ExtractConcatanable<A>}.${ExtractConcatanable<B>}`;


// because typescript complains if it can be an infinite recursion => we max out to 20 levels of recurrsion
// (array.prototype.flat is doing so also => see ts definition)
type Levels = [ -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ];

export type FlatKeys<O extends {}, Depth extends number = 20> = ValueOf<{
    [ K in keyof O ]: Depth extends 0 ? '' : O[ K ] extends object ? Concat<K, FlatKeys<O[ K ], Levels[ Depth ]>> : K
}>;

// Same thing but with another implementation inspired by Array.prototype.flat method
/* type FlatKeys2<O extends {}, Depth extends number = 20> = {
    "done": keyof O,
    "recur": ValueOf<{
        [ K in keyof O ]: O[ K ] extends object ? Concat<K, FlatKeys2<O[ K ], Levels[ Depth ]>> : K;
    }>;
}[ Depth extends -1 ? "done" : "recur" ];
 */

// const o = { a: 1, b: { b1: { b2: 2 } } }; => [ 'a', 'b.b1.b2' ];


export type ConcatenatedKeysRecursive<O extends {}> = FlatKeys<O> extends any ? string[] : FlatKeys<O>[];
