// inspired by https://stackoverflow.com/questions/52931116/decompose-a-typescript-union-type-into-specific-types

type UnionToFuncParam<U> = U extends any ? (k: U) => void : never;
type UnionFuncParamToIntersection<U> = UnionToFuncParam<U> extends ((k: infer I) => void) ? I : never;
type ExtractFuncParm<F> = F extends { (a: infer A): void; } ? A : never;

// the built-in type Exclude<T, U> = T extends U ? never : T is not adapted for us because
// if A = { a:1 } | { a:1; b:2 } => Exclude<A, { a:1 }> == never
// we need ExcludeExact<A, { a:1}> == { a:1; b:2 }
type ExcludeExact<T, U> = T extends U ? U extends T ? never : T : T;
type SpliceOne<Union> = ExcludeExact<Union, ExtractOne<Union>>;
type ExtractOne<Union> = ExtractFuncParm<UnionFuncParamToIntersection<UnionToFuncParam<Union>>>;

// export type ToTuple<Union> = ToTupleImpl<Union, []>;

// type ToTupleImpl<Union, Rest extends any[]> =
//     SpliceOne<Union> extends never ? [ ExtractOne<Union>, ...Rest ]
//     : ToTupleImpl<SpliceOne<Union>, [ ExtractOne<Union>, ...Rest ]>
//     ;


export type UnionReducers = 'tuple' | 'intersection' | 'function-params';

export type UnionReduce<Union, Reducer extends UnionReducers, Container> = UnionReduceImpl<Reducer, Union, Container>;

export type UnionReducer<Reducer extends UnionReducers, T, Container> =
    Reducer extends 'tuple' ? Container extends any[] ? [ T, ...Container ] : never :
    Reducer extends 'intersection' ? { [ K in keyof (T & Container) ]: (T & Container)[ K ] } :
    Reducer extends 'function-params' ? Container extends (...args: any[]) => any ? (...args: [ ...Parameters<Container>, T ]) => ReturnType<Container> : never :
    never;

type UnionReduceImpl<Reducer extends UnionReducers, Union, Container> =
    SpliceOne<Union> extends never ? UnionReducer<Reducer, ExtractOne<Union>, Container>
    : UnionReduceImpl<Reducer, SpliceOne<Union>, UnionReducer<Reducer, ExtractOne<Union>, Container>>;


export type ToTuple<Union> = UnionReduce<Union, 'tuple', []>;
export type ToIntersection<Union> = UnionReduce<Union, 'intersection', {}>;
export type ToFunctionParams<Union, R = void> = UnionReduce<Union, 'function-params', () => R>;


// type Test = ToTuple<5 | 6 | "l" | RegExp>;
// type Test = [RegExp, 5, 6, "l"]

// type Test = ToIntersection<{ a: 1; } | { b: 2; } | { c: 3; }>;
// type Test = {
//     a: 1;
//     b: 2;
//     c: 3;
// }

// type Test = ToFunctionParams<1 | 2 | 3, number>;
// type Test = (args_0: 3, args_1: 2, args_2: 1) => number


// type U = 5 | 6 | "l" | RegExp;

// type Test = UnionToFuncParam<U>;
// type Test = ((k: RegExp) => void) | ((k: 5) => void) | ((k: 6) => void) | ((k: "l") => void);

// type Test2 = UnionFuncParamToIntersection<UnionToFuncParam<U>>;
// type Test2 = ((k: RegExp) => void) & ((k: 5) => void) & ((k: 6) => void) & ((k: "l") => void);

// type Test3 = ExtractFuncParm<UnionFuncParamToIntersection<UnionToFuncParam<U>>>;
// type Test3 = "l"

// type Test4 = SpliceOne<U>;
// type Test4 = RegExp | 5 | 6

// type Test5 = ToTuple<U>;
// type Test5 = [RegExp, 5, 6, "l"]
