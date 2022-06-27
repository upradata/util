import { Arr } from './useful';

export type TupleSize<T extends Arr> = T extends { length: infer N; } ? N : never;

export type TupleFirst<T extends Arr> = T extends readonly [ infer F, ...any ] ? F : never;

export type TupleValues<T extends Arr> = T extends readonly [ infer F, ...infer R ] ? F | TupleValues<R> : never;


// type Test = TupleValues<readonly [ 'a', 'b', 'c' ]>;
// type Test2 = TupleValues<[ 'a', 'b', 'c' ]>;
