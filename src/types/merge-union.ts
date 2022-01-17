// help with https://stackoverflow.com/questions/56296506/typescript-generic-interface-as-union-of-other-interfaces


// first attempt => failed

// type Merge<TUnion> = Pick<TUnion, Keys<TUnion>>;

// type A = { a?: string; b: string; c: number; e: number; } | { a?: number; b: string[]; c?: number; d: string; };
// type Test = Merge<A>;

// type Test = {
//     a?: string | number;
//     b: string | string[];
//     c?: number;
//     e: unknown;
//     d: unknown;
// };

// properties e and d are of type unknown
// Indeed, const a:A ==> a will have only the properties in common

// SOLUTION ==> split the common and uncommon properties and recreate the merged properties type




// keyof A | B will return keys that are in common
// type A = keyof ({ a: string; } | { a: number; b: string; });
// ==> type A = "a"
type CommonKeys<T> = keyof T;

// to get the rest, we only need to use generic parameters distribution as follow
type Keys<T> = T extends unknown ? keyof T : never;
type NonCommonKeys<T> = Exclude<Keys<T>, CommonKeys<T>>;


// Luckily, { [P in K]: T[P]; } (being exactly Pick), will keep optional properties
// type A = Pick<{ a?: string; b: string; c?: number; }, 'a' | 'b' | 'c'>;
// type A = {
//     a?: string;
//     b: string;
//     c?: number;
// }

type Common<T> = Pick<T, CommonKeys<T>>;

// failed for the same reason as above. We need parameters distribution
// type NonCommons<T> = Pick<T, NonCommonKeys<T>>;
// Partial is necessary yo make work optional properties (works with required and optional of course)
// when T = {} | { a: 1; } for instance, we have to handle the case where the object is totally empty
// otherwise, we will have { a?: unknown } instead of { a?: 1 }
// ==> test is done with "keyof T extends never" ("{} extends T" works only for non optional properties, {} extends { a?: any } is true)
type NonCommon<T, K extends PropertyKey> = T extends Partial<Record<K, infer V>> ? keyof T extends never ? never : V : never;

type NonCommons<T> = {
    // NonCommon properties must be optional as their are not in every type of the union
    [ K in NonCommonKeys<T> ]?: NonCommon<T, K>;
};

// type Test = NonCommons<{} | { a: 1; } | {} | { b?: 2; }>;
// type Test = {
//     a?: 1;
//     b?: 2;
// }

type Values<T extends {}> = {
    [ K in keyof T ]: T[ K ];
};

// see next comment for reason why to use Values being facultative
export type Merge<TUnion> = Values<
    Common<TUnion> &
    NonCommons<TUnion>
>;

// type A = { a?: string; b: string; c: number; e: number; } | { a?: number; b: string[]; c?: number; d: string; };
// type Test = Merge<A>;
// type Test2 = Merge<Partial<{ b: 2; c: 3; }> | { a: 1; }>;


// type Test = {
//     a?: string | number;
//     b: string | string[];
//     c?: number;
//     e?: number;
//     d?: string;
// }

// type Test2 = {
//     a?: 1;
//     b?: 2;
//     c?: 3;
// }



// without Values it is working. But the type is awful to read in the IDE

// For instance ==>
// type Merge2<TUnion> = CommonValues<TUnion> & NonCommons<TUnion>;

// type Test = Merge<A>;
// type Test1 = Merge2<A>;

// let t: Test;
// // type Test = {
// //     a?: string | number;
// //     b: string | string[];
// //     c?: number;
// //     e?: number;
// //     d?: string;
// // }
// let t2: Test1;
// // type Test1 = CommonValues<A> & NonCommons<A>

// t.a; // (property) a?: string | number
// t2.a; // (property) a?: string | number
