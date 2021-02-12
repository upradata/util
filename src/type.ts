export type Key = string | number | symbol;
export type Prop = Key;
export type NonObject = string | number | bigint | symbol | boolean | Function | RegExp;

export type RecordOf<T = any> = Record<Key, T>;

export interface ObjectOf<T> {
    [ K: string ]: T;
};

export type InferRecordType<O> = O extends { [ K in Key ]: infer U; } ? U : never;
export type InferArrayType<A> = A extends Arr<infer U> ? U : never;

export type Typify<T> = { [ K in keyof T ]: T[ K ] };


export type ValueOf<O extends {}> = O[ keyof O ];

export type PlainObj<T = any> = RecordOf<T>;

/* export type PartialRecursive<T> = PartialRec<T>;

type isArray<T> = T extends (infer U)[] ? true : false;

type PartialRec<T> = {
    [ K in keyof T ]?: isArray<T[ K ]> extends true ? T[ K ] : PartialRecursive<T[ K ]>;
}; */

// https://stackoverflow.com/questions/41980195/recursive-partialt-in-typescript-2-1
// more compact than mine
/*export type PartialRecursive<T> = {
    [ K in keyof T ]?:
    T[ K ] extends (infer U)[] ? T[ K ] :
    T[ K ] extends object ? PartialRecursiveWithArray<T[ K ]> :
    T[ K ];
};

export type PartialRecursiveWithArray<T> = {
    [ K in keyof T ]?:
    T[ K ] extends (infer U)[] ? PartialRecursiveWithArray<U>[] :
    T[ K ] extends object ? PartialRecursiveWithArray<T[ K ]> :
    T[ K ];
};*/

export type PartialRecursive<T> = {
    [ K in keyof T ]?:
    T[ K ] extends (infer U)[] ? T[ K ] :
    T[ K ] extends object ? PartialRecursive<T[ K ]> :
    T[ K ];
};


export type RecordRecursive<O extends {}, Type> = {
    [ K in keyof O ]: O[ K ] extends Arr<any> ? Type : O[ K ] extends object ? RecordRecursive<O[ K ], Type> : Type
};



export type Function0<R = any> = () => R;
export type Function1<Arg1, R = any> = (arg1: Arg1) => R;
export type Function2<Arg1, Arg2, R = any> = (arg1: Arg1, arg2: Arg2) => R;
export type Function3<Arg1, Arg2, Arg3, R = any> = (arg1: Arg1, arg2: Arg2, arg3: Arg3) => R;
export type Function4<Arg1, Arg2, Arg3, Arg4, R = any> = (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4) => R;
export type Function5<Arg1, Arg2, Arg3, Arg4, Arg5, R = any> = (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5) => R;
export type AnyFunction<R = any> = (...args: Arr<any>) => R;


export type Constructor<P = any, I = object> = new (...input: P[]) => I;
export type Constructor0<I = object> = new () => I;
export type Constructor1<P1, I = object> = new (p1: P1) => I;
export type Constructor2<P1, P2, I = object> = new (p1: P1, p2: P2) => I;
export type Constructor3<P1, P2, P3, I = object> = new (p1: P1, p2: P2, p3: P3) => I;
export type Constructor4<P1, P2, P3, P4, I = object> = new (p1: P1, p2: P2, p3: P3, p4: P4) => I;
export type Constructor5<P1, P2, P3, P4, P5, I = object> = new (p1: P1, p2: P2, p3: P3, p4: P4, p5: P5) => I;

type Int = [ -1, 0, 1, 2, 3, 4, 5, 6 ];
export type GetParam<F extends Function, N extends Int[ number ]> = N extends 1 ? F extends (arg: infer U, ...args: any[]) => any ? U : never : GetParam<F, Int[ N ]>;


export type TT<K> = K | Arr<K>;

export type TT$<K> = K | Promise<K>;

export type BuildType<Types, T> = {
    [ k in keyof Types ]: T;
};


export type FunctionPropertyNames<T> = { [ K in keyof T ]: T[ K ] extends Function ? K : never }[ keyof T ];
export type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;

export type NonFunctionPropertyNames<T> = { [ K in keyof T ]: T[ K ] extends Function ? never : K }[ keyof T ];
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;


// Matches any [typed array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), like `Uint8Array` or `Float64Array`.
export type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array
    | BigInt64Array
    | BigUint64Array
    | DataView;



// let b: ExcludeType<{ a: 1; b: undefined; c: 2; }, undefined>; => 'a' | 'b';
export type ExcludeKeysType<T, OmitType> = { [ K in keyof T ]: T[ K ] extends OmitType ? never : K; }[ keyof T ];
export type ExtractKeysType<T, IncludeType> = { [ K in keyof T ]: T[ K ] extends IncludeType ? K : never; }[ keyof T ];


// let b1: OmitType<{ a: 1; b: undefined; c: 2; }, undefined>; => { a: 1; c: 2; }
// let b2: PickType<{ a: 1; b: undefined; c: 2; }, undefined>; => { b: undefined; }
export type OmitType<T, OmitType> = Pick<T, ExcludeKeysType<T, OmitType>>;
export type PickType<T, OmitType> = Omit<T, ExcludeKeysType<T, OmitType>>;

// It is less good this implementation because unpicked keys are not deleted but are with type "never"
export type PickType2<O, T> = {
    [ K in keyof O ]: Extract<O[ K ], T>
};



export type ToString = { toString(): string; };

export type Arr<T> = Array<T> | ReadonlyArray<T>;
