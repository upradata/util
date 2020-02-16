export interface ObjectOf<T = any> {
    [ k: string ]: T;
}

export type PlainObj<T = any> = ObjectOf<T>;

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


export type Function0<R = any> = () => R;
export type Function1<Arg1, R = any> = (arg1: Arg1) => R;
export type Function2<Arg1, Arg2, R = any> = (arg1: Arg1, arg2: Arg2) => R;
export type Function3<Arg1, Arg2, Arg3, R = any> = (arg1: Arg1, arg2: Arg2, arg3: Arg3) => R;
export type Function4<Arg1, Arg2, Arg3, Arg4, R = any> = (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4) => R;
export type Function5<Arg1, Arg2, Arg3, Arg4, Arg5, R = any> = (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5) => R;


export type TT$<K> = K | Promise<K>;

export type BuildType<Types, T> = {
    [ k in keyof Types ]: T;
};
