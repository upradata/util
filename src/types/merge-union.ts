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

type Test11 = Keys<
    | { a?: string; b: string; }
    | { a?: number; c?: number; }
>;


// Luckily, { [P in K]: T[P]; } (being exactly Pick), will keep optional properties
// type A = Pick<{ a?: string; b: string; c?: number; }, 'a' | 'b' | 'c'>;
// type A = {
//     a?: string;
//     b: string;
//     c?: number;
// }

type CommonValues<T> = Pick<T, CommonKeys<T>>;

// failed for the same reason as above. We need parameters distribution
// type NonCommonValues<T> = Pick<T, NonCommonKeys<T>>;
// Partial is necessary yo make work optional properties (works with required and optional of course)
type NonCommonValue<T, K extends PropertyKey> = T extends Partial<Record<K, infer V>> ? V : never;

type NonCommonValues<T> = {
    [ K in NonCommonKeys<T> ]?: NonCommonValue<T, K>; // NonCommon properties must be optional
};


type Values<T extends {}> = {
    [ K in keyof T ]: T[ K ];
};

export type Merge<TUnion> = Values<
    CommonValues<TUnion> &
    NonCommonValues<TUnion>
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
