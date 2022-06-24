
import { NonObject, Levels } from '../types';


/* export type PrimitiveRecursive<T> = {
    [ K in keyof T ]: T[ K ] extends object ? PrimitiveRecursive<T[ K ]> : T[ K ]
}[ keyof T ]; */

export type PrimitiveRecursive<O extends {}, Depth extends Levels[ number ] = 20> = Depth extends 0 ? NonObject : {
    [ K in keyof O ]: O[ K ] extends object ? PrimitiveRecursive<O[ K ], Levels[ Depth ]> : O[ K ]
}[ keyof O ];


/* export type KeysRecursive<T> = keyof T | {
    [ K in keyof T ]: T[ K ] extends object ? KeysRecursive<T[ K ]> : never
}[ keyof T ]; */


/* export type _KeysRecursive<O extends {}, Depth extends number = 20> = Depth extends 0 ? keyof O : keyof O | {
    [ K in keyof O ]: O[ K ] extends object ? _KeysRecursive<O[ K ], Levels[ Depth ]> : never
}[ keyof O ]; */

export type KeysRecursive<O extends {}, Depth extends Levels[ number ] = 20> = Depth extends 0 ? keyof O : keyof O | {
    [ K in keyof O ]: O[ K ] extends object ? KeysRecursive<O[ K ], Levels[ Depth ]> : never
}[ keyof O ];

// export type KeysRecursive2<O extends {}> = _KeysRecursive<O> extends string | number | symbol ? _KeysRecursive<O> : Key;

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


export type FlatKeys<O extends {}, Depth extends Levels[ number ] = 20> = {
    [ K in keyof O ]: Depth extends 0 ? '' : O[ K ] extends object ? K | Concat<K, FlatKeys<O[ K ], Levels[ Depth ]>> : K
}[ keyof O ];

// Same thing but with another implementation inspired by Array.prototype.flat method
/* type FlatKeys2<O extends {}, Depth extends number = 20> = {
    "done": keyof O,
    "recur": ValueOf<{
        [ K in keyof O ]: O[ K ] extends object ? Concat<K, FlatKeys2<O[ K ], Levels[ Depth ]>> : K;
    }>;
}[ Depth extends -1 ? "done" : "recur" ];
 */

// const o = { a: 1, b: { b1: { b2: 2 } } }; => [ 'a', 'b.b1.b2' ];


export type ConcatenatedKeysRecursive<O> = FlatKeys<O> extends string ? FlatKeys<O>[] : string[];
// FlatKeys<O> extends any ? string[] : FlatKeys<O>[];


/* type Test<T> = T extends string ? true : false;
type AA = Test<any>;
type AA2 = Test<'&' | 'a' | 1>; */

// type T = ConcatenatedKeysRecursive<{ a: 1; b: { c: 2; }; }>;

export type Get<O extends {}, Keys, Depth extends Levels[ number ] = 20> = Depth extends 0 ? unknown :
    Keys extends `${infer Key}.${infer RestKeys}` ?
    Get<O[ Key & keyof O ], RestKeys, Levels[ Depth ]> : O[ Keys & keyof O ];

// export type Test<Keys> = Keys extends `${infer Key}.${infer RestKeys}` ? { keys: Keys; rest: RestKeys; } : never;

// type A = Test<'a.b'>;
// type T = FlatKeys<{ a: 1; b: { b1: { b2: 2; }; }; }>;
// type T1 = Get<{ a: 1; b: { b1: { b2: 2; }; }; }, 'b'>;
// type T2 = Get<{ a: 1; b: { b1: { b2: 2; }; }; }, 'b.b1'>;
