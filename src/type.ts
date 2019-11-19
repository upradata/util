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
