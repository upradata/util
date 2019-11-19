
import { PlainObj, PartialRecursive } from './type';


export type AssignMode = 'of' | 'in';
export type ArrayMode = 'merge' | 'replace';

export class AssignOption {
    assignMode?: AssignMode = 'of';
    arrayMode?: ArrayMode = 'merge';
    depth?: number = NaN;
}



class Assign {
    assignMode: AssignMode;
    arrayMode: ArrayMode;
    depth: number;

    constructor(private out: PlainObj, private ins: PlainObj[], option?: AssignOption) {
        Object.assign(this, new AssignOption(), option);
    }

    private lastLevel() {
        return !isNaN(this.depth) && this.depth === 1;
    }

    private isObjectOrArray(e: any) {
        return typeof e === 'object' && e !== null;
    }

    assignRecursive() {
        const { assignMode, arrayMode, depth, out, ins } = this;

        const to = typeof (out) === 'object' ? out : {}; //  Object(out);

        for (const inn of ins) {
            if (inn === undefined || inn === null)
                continue;

            for (const prop in inn) {

                if (assignMode === 'of' && inn.hasOwnProperty(prop) || assignMode === 'in') {
                    // recursion
                    if (this.isObjectOrArray(inn[ prop ]) && !this.lastLevel()) { // array also
                        if (Array.isArray(inn[ prop ]) && arrayMode === 'replace')
                            to[ prop ] = inn[ prop ];
                        else {
                            const defaultTo = Array.isArray(inn[ prop ]) ? [] : {};
                            const option = { assignMode, arrayMode, depth: depth - 1 };

                            to[ prop ] = new Assign(to[ prop ] || defaultTo, [ inn[ prop ] ], option).assignRecursive();
                        }
                    } else
                        // normal case
                        to[ prop ] = inn[ prop ];
                }
            }
        }

        return to;
    }

}




export function assignRecursiveArray<T1 extends PlainObj, T2 extends PlainObj>(out: T1, inn: [ T2 ], assignMode?: AssignOption): T1 & T2;
export function assignRecursiveArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj>(out: T1, inn: [ T2, T3 ], assignMode?: AssignOption): T1 & T2 & T3;
export function assignRecursiveArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj>(out: T1, inn: [ T2, T3, T4 ], assignMode?: AssignOption): T1 & T2 & T3 & T4;
export function assignRecursiveArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj, T5 extends PlainObj>(out: T1, inn: [ T2, T3, T4, T5 ], assignMode?: AssignOption): T1 & T2 & T3 & T4 & T5;
export function assignRecursiveArray(out: PlainObj, ins: PlainObj[], assignMode?: AssignOption) {

    return new Assign(out, ins, assignMode).assignRecursive();
}



export function assignRecursive<T1 extends PlainObj, T2 extends PlainObj>(out: T1, inn: T2): T1 & T2;
export function assignRecursive<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj>(out: T1, inn1: T2, inn2: T3): T1 & T2 & T3;
export function assignRecursive<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj>(out: T1, inn1: T2, inn2: T3, inn3: T4): T1 & T2 & T3 & T4;
export function assignRecursive<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj, T5 extends PlainObj>(out: T1, inn1: T2, inn2: T3, inn3: T4, inn4: T5): T1 & T2 & T3 & T4 & T5;
export function assignRecursive(out: PlainObj, ...ins: PlainObj[]) {
    // it is not possible to add a third argument (assignMode?: AssignOption) after an elliptic arg
    return new Assign(out, ins).assignRecursive();
}


type AssignOptionRed = Omit<AssignOption, 'assignMode'>;

export function assignRecursiveInArray<T1 extends PlainObj, T2 extends PlainObj>(out: T1, inn: [ T2 ], assignMode?: AssignOptionRed): T1 & T2;
export function assignRecursiveInArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj>(out: T1, inn: [ T2, T3 ], assignMode?: AssignOptionRed): T1 & T2 & T3;
export function assignRecursiveInArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj>(out: T1, inn: [ T2, T3, T4 ], assignMode?: AssignOptionRed): T1 & T2 & T3 & T4;
export function assignRecursiveInArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj, T5 extends PlainObj>(out: T1, inn: [ T2, T3, T4, T5 ], assignMode?: AssignOptionRed): T1 & T2 & T3 & T4 & T5;
export function assignRecursiveInArray(out: PlainObj, ins: PlainObj[], assignMode: AssignOptionRed) {

    return new Assign(out, ins, { ...assignMode, assignMode: 'in' }).assignRecursive();
}

export function assignRecursiveIn<T1 extends PlainObj, T2 extends PlainObj>(out: T1, inn: T2): T1 & T2;
export function assignRecursiveIn<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj>(out: T1, inn1: T2, inn2: T3): T1 & T2 & T3;
export function assignRecursiveIn<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj>(out: T1, inn1: T2, inn2: T3, inn3: T4): T1 & T2 & T3 & T4;
export function assignRecursiveIn<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj, T5 extends PlainObj>(out: T1, inn1: T2, inn2: T3, inn3: T4, inn4: T5): T1 & T2 & T3 & T4 & T5;
export function assignRecursiveIn(out: PlainObj, ...ins: PlainObj[]) {

    return new Assign(out, ins, { assignMode: 'in', arrayMode: 'merge' }).assignRecursive();
}


export function assignDefaultOption<T extends PlainObj>(defaultOption: T, option: PartialRecursive<T>, assignMode: AssignOption = { assignMode: 'in', arrayMode: 'merge' }): T {

    return assignRecursiveArray({}, [ defaultOption, option ], assignMode);
}
