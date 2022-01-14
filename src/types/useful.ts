export type Key = string | number | symbol;
export type Prop = Key;
export type NonObject = string | number | bigint | symbol | boolean | Function | RegExp;

export type RecordOf<T = any> = Record<Key, T>;

export interface ObjectOf<T> {
    [ K: string ]: T;
    [ K: number ]: T;
}

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
/* export type PartialRecursive<T> = {
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

export type PartialRecursive<T, Options extends 'array' | 'strict' = 'strict'> = {
    [ K in keyof T ]?:
    T[ K ] extends (RegExp | Date) ? T[ K ] :
    T[ K ] extends (...args: any[]) => any ? T[ K ] :

    Options extends 'array' ? T[ K ] extends Arr<infer U> ? PartialRecursive<U, Options>[] : T[ K ] :
    T[ K ] extends unknown[] ? Options extends 'array' ? PartialRecursive<InferArrayType<T[ K ]>, Options>[] : T[ K ] :

    T[ K ] extends object ? PartialRecursive<T[ K ], Options> :
    T[ K ];
};

// type AA = PartialRecursive<{ a: (pathDest: string) => void | Promise<void>; b: 2; r: RegExp; d: Date; arr: { a: number; }[]; }, 'array'>;

export type RecordRecursive<O extends {}, Type> = {
    [ K in keyof O ]: O[ K ] extends Arr<any> ? Type : O[ K ] extends object ? RecordRecursive<O[ K ], Type> : Type
};





// because typescript complains if it can be an infinite recursion => we max out to 20 levels of recurrsion
// (array.prototype.flat is doing so also => see ts definition)
export type Levels = [ -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ];


export type GetParam<F extends Function, N extends Levels[ number ]> = N extends 1 ?
    F extends (arg: infer U, ...args: any[]) => any ? U : never :
    GetParam<F, Levels[ N ]>;


export type VariableType = 'mutable' | 'readonly' | 'both';

export type Arr<T = unknown, Type extends VariableType = 'both'> = Type extends 'both' ? Array<T> | ReadonlyArray<T> : Type extends 'mutable' ? Array<T> : ReadonlyArray<T>;

export type TT<K, Type extends VariableType = 'both'> = K | Arr<K, Type>;


export type TT$<K> = K | Promise<K>;

export type FF<T, Args extends [ any?, any?, any?, any?, any?, any?, ] = []> = T | ((...args: Args) => T);


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
export type PickTypeWithNever<O, T> = {
    [ K in keyof O ]: Extract<O[ K ], T>
};



export type ToString = { toString(): string; };

export type TupleSize<T extends Arr<any>> = T extends { length: infer N; } ? N : never;



/*
 https://stackoverflow.com/questions/49579094/typescript-conditional-types-filter-out-readonly-properties-pick-only-requir

For optional properties, you can indeed detect them and therefore extract or exclude them.
The insight here is that {} extends {a?: string}, but {} does not extend {a: string} or even {a: string | undefined}. Here's how you could build a way to remove optional properties from a type:
*/

export type RequiredKeys<T> = { [ K in keyof T ]-?:
    ({} extends { [ P in K ]: T[ K ] } ? never : K)
}[ keyof T ];

export type OptionalKeys<T> = { [ K in keyof T ]-?:
    ({} extends { [ P in K ]: T[ K ] } ? K : never)
}[ keyof T ];

export type RequiredProps<T> = Pick<T, RequiredKeys<T>>;
export type OptionalProps<T> = Pick<T, OptionalKeys<T>>;

/*
type I3 = {
    a: string,
    b?: number,
    c: boolean | undefined;
};

type I4 = ExcludeOptionalProps<I3>;
{ a: string; c: boolean | undefined; }
*/


// Opposite of Partial
export type Requirize<T> = {
    [ P in keyof T ]-?: T[ P ];
};


export type IfThenElse<T extends boolean, U, V = never> = T extends true ? U : V;

export type Is<T, U> = T extends U ? true : false;

export type Or<T, U> = T extends true ? true : U extends true ? true : false;

export type And<T, U> = T extends true ? U extends true ? true : false : false;




// https://github.com/microsoft/TypeScript/issues/23182
// Just for the example. To make it work, it has to be placed directly when necessary
// export type IsNeverType<T> = [ T ] extends [ never ] ? true : never;


// https://github.com/microsoft/TypeScript/issues/29368
// Just for the example. To make it work, it has to be placed directly when necessary
// export type NoDistribute<T> = [ T ] extends [ T ] ? T : never;



// export type Camelize<S extends string, delimiter extends string = '.'> = S extends `${infer U}${delimiter}${infer V}` ? `${Lowercase<U>}-${Camelize<V>}` : Lowercase<S>;
export type AlphabetLower = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k'
    | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x'
    | 'y' | 'z';

export type AlphabetUpper = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K'
    | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X'
    | 'Y' | 'Z';

export type Numbers = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';


// https://ghaiklor.github.io/types-challenges-solutions/en/medium-kebabcase.html
// S extends `${infer C}${infer T}` allows to get the [head, tail] with head=first letter and tail=the rest :))
export type KebabCase<S> = S extends `${infer Char}${infer Rest}`
    // 2 cases: 1) rest=ab... 2) we have rest=Ab....
    ? Rest extends Uncapitalize<Rest> ? `${Uncapitalize<Char>}${KebabCase<Rest>}` : `${Uncapitalize<Char>}-${KebabCase<Rest>}`
    : S;

// https://ghaiklor.github.io/types-challenges-solutions/en/medium-camelcase.html
export type CamelCase<S> = S extends `${infer Char}-${infer Rest}`
    ? Rest extends Capitalize<Rest> ? `${Char}-${CamelCase<Rest>}` : `${Char}${CamelCase<Capitalize<Rest>>}`
    : S;

// type S = KebabCase<'testTheCamelCase'>;
// type S = KebabCase<'test-the-camel-case'>;


declare const NotDefinedSymbol: unique symbol;
export type NotDefined = typeof NotDefinedSymbol;
