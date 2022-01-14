
/*
import { random } from './random';

 IT IS WORKING. BUT WITH TOOLS LIKE ROLLUP/WEBPACK, IT IS A NIGHTMARE BECAUSE THEY CAN TRY TO INCLUDE NODEJS CRYPTO IN BROWER ENVIRONMENT (WEBPACK I FOUND THE SOLUTION TO
NO TO, BUT ROLLUP NO).

I PREFER TO SEPARATE THEM
*/


import { TypedArray } from './types';

export function guidGenerator(random: (array: TypedArray) => number) {
    return () => ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: string) =>
        (+c ^ random(new Uint8Array(1))[ 0 ] & 15 >> +c / 4).toString(16)
    );
}
