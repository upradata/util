
import { PlainObj, PartialRecursive } from './type';
import { isDefined } from './is';
import { isUndefined } from 'ts-util-is';


export type AssignMode = 'of' | 'in';
export type ArrayMode = 'merge' | 'replace' | 'concat';

export type AssignOpts = Omit<AssignOptions, 'onlyExistingProp'> & { onlyExistingProp?: boolean | { level: number; }; };

export class AssignOptions {
    assignMode?: AssignMode = 'of';
    arrayMode?: ArrayMode = 'merge';
    depth?: number = NaN;
    onlyExistingProp?: { level: number; } = { level: 0 };
    props?: (string | symbol)[] = undefined;
    except?: (string | symbol)[] = undefined;
    transform?: (key: string | symbol, value: any) => any = undefined;
    isOption?: boolean = true;

    constructor(options: AssignOpts) {
        const opts = { ...options };

        if (typeof opts.onlyExistingProp === 'boolean') {
            if (!opts.onlyExistingProp)
                throw new Error(`onlyExistingProp option has to be true or { level: number }`);

            opts.onlyExistingProp = { level: Infinity };
        }

        Object.assign(this, opts);
    }
}

function isAssignOptions(v: any): v is AssignOptions {
    return isDefined(v) && (v instanceof AssignOptions || v.isOption === true);
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

    private assignProp(prop: string, to: any, from: any, isFromPrimitive: boolean) {
        const { onlyExistingProp, props, except, transform } = this.options;

        const getFrom = () => {
            const v = typeof from === 'function' ? from() : from[ prop ];
            return isDefined(transform) ? transform(prop, v) : v;
        };

        if (except) {
            const property = this.findDotProp(prop, except) as string;
            if (isDefined(property) && property.split('.').pop() === prop)
                return;
        }

        if (onlyExistingProp && this.currentlevel < onlyExistingProp.level && !isFromPrimitive) {

            if (prop in to)
                to[ prop ] = getFrom();

        } else if (props) {
            const property = this.findDotProp(prop, props);

            if (isDefined(property))
                to[ prop ] = getFrom();

        } else {
            to[ prop ] = getFrom();
        }
    }

    private findDotProp(property: string, props: (string | symbol)[]) {
        if (isUndefined(props))
            return undefined;

        let foundProp: (string | symbol) = undefined;

        for (const p of props) {
            let prop = p;

            if (typeof p === 'string')
                prop = p.split('.')[ this.currentlevel ];

            if (prop === property) {
                foundProp = p;
                break;
            }
        }

        return foundProp;
    }

    assignRecursive(currentLevel: number = 0, fromPrimitive: boolean = false) {
        this.currentlevel = currentLevel;

        const { out, ins } = this;
        const { assignMode, arrayMode, depth } = this.options;

        const to = typeof out === 'object' ? out : {};
        const isPrimitive = fromPrimitive || typeof out !== 'object';

        for (const inn of ins) {
            if (inn === undefined || inn === null)
                continue;

            for (const prop in inn) {

                if (assignMode === 'of' && inn.hasOwnProperty(prop) || assignMode === 'in') {
                    // recursion
                    if (this.isObjectOrArray(inn[ prop ]) && !this.lastLevel()) { // array also
                        if (Array.isArray(inn[ prop ]) && arrayMode !== 'merge') {
                            if (arrayMode === 'replace')
                                this.assignProp(prop, to, inn, isPrimitive);
                            else { // concat
                                if (isDefined(to[ prop ]) && !Array.isArray(to[ prop ]))
                                    throw new Error(`Error while assigning: property ${prop} in ${to} is not an array (concat mode)`);

                                const toArr = isDefined(to[ prop ]) ? to[ prop ] : [];
                                this.assignProp(prop, to, { [ prop ]: toArr.concat(inn[ prop ]) }, isPrimitive);
                            }
                        } else {
                            const defaultTo = Array.isArray(inn[ prop ]) ? [] : {};
                            const option = { ...this.options, depth: depth - 1 };

                            this.assignProp(prop,
                                to,
                                () => new Assign(to[ prop ] || defaultTo, [ inn[ prop ] ], option).assignRecursive(currentLevel + 1, isPrimitive || typeof to[ prop ] !== 'object'),
                                isPrimitive
                            );
                        }
                    } else
                        // normal case
                        this.assignProp(prop, to, inn, isPrimitive);
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
export function assignRecursive(out: PlainObj, ...ins: (PlainObj | AssignOptions)[]) {

    if (isAssignOptions(ins[ ins.length - 1 ])) {
        const options = ins[ ins.length - 1 ];
        return assignRecursiveArray(out, ins.slice(0, -1) as any, options);
    }

    return assignRecursiveArray(out, ins as any);
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
export function assignRecursiveIn(out: PlainObj, ...ins: (PlainObj | AssignOptionRed)[]) {

    if (isAssignOptions(ins[ ins.length - 1 ]))
        return assignRecursiveInArray(out, ins.slice(-1) as any, ins[ ins.length - 1 ]);

    return assignRecursiveInArray(out, ins as any);
}


export function assignDefaultOption<T extends PlainObj>(defaultOption: T, option: PartialRecursive<T>, assignMode: AssignOptions = { assignMode: 'in', arrayMode: 'merge' }): T {

    return assignRecursiveArray({}, [ defaultOption, option ], assignMode);
}
