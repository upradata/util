
type IsRecrusivable<T> = never |
    T extends (RegExp | Date) ? false :
    T extends (...args: any[]) => any ? false :
    T extends unknown[] ? true :
    T extends object ? true :
    false;


type CommonKeys<T> = keyof T;
type Keys<T> = T extends unknown ? keyof T : never;
type NonCommonKeys<T> = Exclude<Keys<T>, CommonKeys<T>>;


type Common<T> = CommonKeys<T> extends infer K1 ? {
    [ K in K1 & CommonKeys<T> ]: IsRecrusivable<T[ K ]> extends true ? MergeReduce<T[ K ]> : T[ K ]
} : never;

type NonCommonValue<T, K extends PropertyKey> = T extends Partial<Record<K, infer V>> ? keyof T extends never ? never : V : never;


type NonCommonValues<T> = NonCommonKeys<T> extends infer K1 ? {
    // NonCommon properties must be optional as their are not in every type of the union
    [ K in K1 & NonCommonKeys<T> ]?: IsRecrusivable<T[ K ]> extends true ? MergeReduce<T[ K ]> : NonCommonValue<T, K>
} : never;




type Values<T extends {}> = T extends T ? {
    [ K in keyof T ]: T[ K ];
} : never;



type UnionToFuncParam<U> = U extends any ? (k: U) => void : never;
type UnionFuncParamToIntersection<U> = UnionToFuncParam<U> extends ((k: infer I) => void) ? I : never;
type ExtractFuncParm<F> = F extends { (a: infer A): void; } ? A : never;

type SpliceOne<Union> = Exclude<Union, ExtractOne<Union>>;
type ExtractOne<Union> = ExtractFuncParm<UnionFuncParamToIntersection<UnionToFuncParam<Union>>>;


type MergeReduce<Union> = MergeReduceImpl<Union, {}>;
type MergeReducer<T, Container> = Merge<T | Container>;
type Merge<T> = Values<Common<T> & NonCommonValues<T>>;

type MergeReduceImpl<Union, Container> =
    SpliceOne<Union> extends never ? MergeReducer<ExtractOne<Union>, Container>
    : MergeReduceImpl<SpliceOne<Union>, MergeReducer<ExtractOne<Union>, Container>>;


// !! See union-reducer for an an explaination and some examples of how the Reducer is working !!
// !! Se merge-union for an an explaination and some examples of how the Merge is working !!
export type MergeRecursive<TUnion> = MergeReduce<TUnion>;


// type Test = MergeRecursive<
//     { a: 1; c: { c1?: 'c1', c2: { c3?: 'c3'; }; }; } |
//     { b?: 2; c: { a: 11; b: { b1: 'b1'; }; c2: { c3: 33; c4: 44; }; }; } |
//     { d: 'd'; c: { c1: '+', c2: { c3: '-'; c5: 55; }; c33: 333; }; }
// >;


// type Test = {
//     c: {
//         c1: "c1" | "+";
//         c2: {
//             c3: "c3" | 33 | "-";
//             c4?: 44;
//             c5?: 55;
//         };
//         b?: {
//             b1: 'b1';
//         };
//         a?: 11;
//         c33?: 333;
//     };
//     d?: "d";
//     b?: 2;
//     a?: 1;
// }
