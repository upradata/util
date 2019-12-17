
import { PlainObj, PartialRecursive } from './type';
import { isDefined } from './is';


export type AssignMode = 'of' | 'in';
export type ArrayMode = 'merge' | 'replace';

export class AssignOptions {
    assignMode?: AssignMode = 'of';
    arrayMode?: ArrayMode = 'merge';
    depth?: number = NaN;
    onlyExistingProp?: boolean = false;
    props?: (string | symbol)[];

    constructor(options: Partial<AssignOptions>) {
        Object.assign(this, options);
    }
}



class Assign {

    private options: AssignOptions;
    private currentlevel: number;

    constructor(private out: PlainObj, private ins: PlainObj[], options?: AssignOptions) {
        this.options = new AssignOptions(options);
    }

    private lastLevel() {
        return !isNaN(this.options.depth) && this.options.depth === 1;
    }

    private isObjectOrArray(e: any) {
        return typeof e === 'object' && e !== null;
    }

    private assignProp(prop: string, to: any, from: any) {
        const getFrom = () => typeof from === 'function' ? from() : from[ prop ];
        const { onlyExistingProp, props } = this.options;

        if (onlyExistingProp) {
            if (isDefined(to[ prop ]))
                to[ prop ] = getFrom();
        } else if (props) {
            const property = this.dotProp(prop);
            if (isDefined(property))
                to[ prop ] = getFrom();
        } else {
            to[ prop ] = getFrom();
        }
    }

    private dotProp(property: string) {
        let foundProp: string = undefined;

        for (const p of this.options.props) {
            let prop = p;

            if (typeof p === 'string')
                prop = p.split('.')[ this.currentlevel ];

            // console.log({ property, p, level: this.currentlevel, prop, pass: prop === property });
            if (prop === property) {
                foundProp = prop;
                break;
            }
        }

        return foundProp;
    }

    assignRecursive(currentLevel: number = 0) {
        this.currentlevel = currentLevel;

        const { out, ins } = this;
        const { assignMode, arrayMode, depth } = this.options;

        const to = typeof (out) === 'object' ? out : {}; //  Object(out);

        for (const inn of ins) {
            if (inn === undefined || inn === null)
                continue;

            for (const prop in inn) {

                if (assignMode === 'of' && inn.hasOwnProperty(prop) || assignMode === 'in') {
                    // recursion
                    if (this.isObjectOrArray(inn[ prop ]) && !this.lastLevel()) { // array also
                        if (Array.isArray(inn[ prop ]) && arrayMode === 'replace')
                            this.assignProp(prop, to, inn);
                        else {
                            const defaultTo = Array.isArray(inn[ prop ]) ? [] : {};
                            const option = { ...this.options, depth: depth - 1 };

                            this.assignProp(prop,
                                to,
                                () => new Assign(to[ prop ] || defaultTo, [ inn[ prop ] ], option).assignRecursive(currentLevel + 1),
                            );
                        }
                    } else
                        // normal case
                        this.assignProp(prop, to, inn);
                }
            }
        }

        return to;
    }

}




export function assignRecursiveArray<T1 extends PlainObj, T2 extends PlainObj>(out: T1, inn: [ T2 ], assignMode?: AssignOptions): T1 & T2;
export function assignRecursiveArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj>(out: T1, inn: [ T2, T3 ], assignMode?: AssignOptions): T1 & T2 & T3;
export function assignRecursiveArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj>(out: T1, inn: [ T2, T3, T4 ], assignMode?: AssignOptions): T1 & T2 & T3 & T4;
export function assignRecursiveArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj, T5 extends PlainObj>(out: T1, inn: [ T2, T3, T4, T5 ], assignMode?: AssignOptions): T1 & T2 & T3 & T4 & T5;
export function assignRecursiveArray(out: PlainObj, ins: PlainObj[], assignMode?: AssignOptions) {

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


type AssignOptionRed = Omit<AssignOptions, 'assignMode'>;

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


export function assignDefaultOption<T extends PlainObj>(defaultOption: T, option: PartialRecursive<T>, assignMode: AssignOptions = { assignMode: 'in', arrayMode: 'merge' }): T {

    return assignRecursiveArray({}, [ defaultOption, option ], assignMode);
}
