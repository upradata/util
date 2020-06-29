
import { PlainObj, PartialRecursive } from './type';
import { isDefined, isUndefined } from './is';


export type AssignMode = 'of' | 'in';
export type ArrayMode = 'merge' | 'replace' | 'concat';

export type AssignOpts = Partial<Omit<AssignOptions, 'onlyExistingProp'> & { onlyExistingProp: boolean | { level: number; }; }>;

export class AssignOptions {
    assignMode: AssignMode = 'of';
    arrayMode: ArrayMode = 'merge';
    depth: number = NaN;
    onlyExistingProp: { level: number; };
    props: (string | symbol)[] = undefined;
    except: (string | symbol)[] = undefined;
    transform: (key: string | symbol, value: any) => any = undefined;
    nonRecursivelyAssignableTypes: any[];
    isOption: boolean = true;

    constructor(options: AssignOpts = {}) {
        const opts = { ...options };

        if (opts.onlyExistingProp) {
            if (typeof opts.onlyExistingProp === 'boolean') {
                if (!opts.onlyExistingProp)
                    throw new Error(`onlyExistingProp option has to be true or { level: number }`);

                opts.onlyExistingProp = { level: Infinity };
            } else {
                opts.onlyExistingProp = Object.assign({ level: Infinity }, opts.onlyExistingProp);
            }
        }

        opts.nonRecursivelyAssignableTypes = [ RegExp ].concat(opts.nonRecursivelyAssignableTypes || []);

        Object.assign(this, opts);
    }
}

function isAssignOptions(v: any): v is AssignOptions {
    return isDefined(v) && (v instanceof AssignOptions || v.isOption === true);
}



class Assign {

    private options: AssignOptions;
    private currentlevel: number;

    constructor(private out: PlainObj, private ins: PlainObj[], options?: AssignOpts) {
        this.options = new AssignOptions(options);
    }

    private lastLevel() {
        return !isNaN(this.options.depth) && this.options.depth === 1;
    }

    private isObjectOrArray(e: any) {
        return typeof e === 'object' && e !== null;
    }

    private assignProp(prop: string, to: any, from: any, outWasPrimitive: boolean) {
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

        if (onlyExistingProp && this.currentlevel < onlyExistingProp.level) {
            if (prop in to || outWasPrimitive)
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
        const { assignMode, arrayMode, depth, nonRecursivelyAssignableTypes } = this.options;

        const to = typeof out === 'object' ? out : {};
        const isPrimitive = fromPrimitive || typeof out !== 'object';

        const isRecAssignable = (v: any) => !nonRecursivelyAssignableTypes.some(type => typeof v === type || v.constructor === type);

        for (const inn of ins) {
            if (inn === undefined || inn === null)
                continue;

            for (const prop in inn) {
                const isPropPrimitive = fromPrimitive || (prop in to) && typeof to[ prop ] !== 'object';

                if ((assignMode === 'of' && inn.hasOwnProperty(prop) || assignMode === 'in')) {
                    // recursion
                    if (this.isObjectOrArray(inn[ prop ]) && !this.lastLevel() && isRecAssignable(inn[ prop ])) { // array also
                        if (Array.isArray(inn[ prop ]) && arrayMode !== 'merge') {
                            if (arrayMode === 'replace')
                                this.assignProp(prop, to, inn, isPropPrimitive);
                            else { // concat
                                if (isDefined(to[ prop ]) && !Array.isArray(to[ prop ]))
                                    throw new Error(`Error while assigning: property ${prop} in ${to} is not an array (concat mode)`);

                                const toArr = isDefined(to[ prop ]) ? to[ prop ] : [];
                                this.assignProp(prop, to, { [ prop ]: toArr.concat(inn[ prop ]) }, isPropPrimitive);
                            }
                        } else {
                            const defaultTo = Array.isArray(inn[ prop ]) ? [] : {};
                            const option = { ...this.options, depth: depth - 1 };

                            this.assignProp(prop,
                                to,
                                () => new Assign(to[ prop ] || defaultTo, [ inn[ prop ] ], option).assignRecursive(currentLevel + 1, isPrimitive || typeof to[ prop ] !== 'object'),
                                isPropPrimitive
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




export function assignRecursiveArray<T1 extends PlainObj, T2 extends PlainObj>(out: T1, inn: [ T2 ], options?: AssignOpts): T1 & T2;
export function assignRecursiveArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj>(out: T1, inn: [ T2, T3 ], options?: AssignOpts): T1 & T2 & T3;
export function assignRecursiveArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj>(out: T1, inn: [ T2, T3, T4 ], options?: AssignOpts): T1 & T2 & T3 & T4;
export function assignRecursiveArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj, T5 extends PlainObj>(out: T1, inn: [ T2, T3, T4, T5 ], options?: AssignOpts): T1 & T2 & T3 & T4 & T5;
export function assignRecursiveArray(out: PlainObj, ins: PlainObj[], options?: AssignOpts) {

    return new Assign(out, ins, options).assignRecursive();
}



export function assignRecursive<T1 extends PlainObj, T2 extends PlainObj>(out: T1, inn: T2): T1 & T2;
export function assignRecursive<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj>(out: T1, inn1: T2, inn2: T3): T1 & T2 & T3;
export function assignRecursive<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj>(out: T1, inn1: T2, inn2: T3, inn3: T4): T1 & T2 & T3 & T4;
export function assignRecursive<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj, T5 extends PlainObj>(out: T1, inn1: T2, inn2: T3, inn3: T4, inn4: T5): T1 & T2 & T3 & T4 & T5;
export function assignRecursive(out: PlainObj, ...ins: (PlainObj | AssignOpts)[]) {

    if (isAssignOptions(ins[ ins.length - 1 ])) {
        const options = ins[ ins.length - 1 ];
        return assignRecursiveArray(out, ins.slice(0, -1) as any, options);
    }

    return assignRecursiveArray(out, ins as any);
}


type AssignOptsRed = Omit<AssignOpts, 'assignMode'>;

export function assignRecursiveInArray<T1 extends PlainObj, T2 extends PlainObj>(out: T1, inn: [ T2 ], options?: AssignOptsRed): T1 & T2;
export function assignRecursiveInArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj>(out: T1, inn: [ T2, T3 ], options?: AssignOptsRed): T1 & T2 & T3;
export function assignRecursiveInArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj>(out: T1, inn: [ T2, T3, T4 ], options?: AssignOptsRed): T1 & T2 & T3 & T4;
export function assignRecursiveInArray<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj, T5 extends PlainObj>(out: T1, inn: [ T2, T3, T4, T5 ], options?: AssignOptsRed): T1 & T2 & T3 & T4 & T5;
export function assignRecursiveInArray(out: PlainObj, ins: PlainObj[], options: AssignOptsRed) {

    return new Assign(out, ins, { ...options, assignMode: 'in' }).assignRecursive();
}

export function assignRecursiveIn<T1 extends PlainObj, T2 extends PlainObj>(out: T1, inn: T2): T1 & T2;
export function assignRecursiveIn<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj>(out: T1, inn1: T2, inn2: T3): T1 & T2 & T3;
export function assignRecursiveIn<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj>(out: T1, inn1: T2, inn2: T3, inn3: T4): T1 & T2 & T3 & T4;
export function assignRecursiveIn<T1 extends PlainObj, T2 extends PlainObj,
    T3 extends PlainObj, T4 extends PlainObj, T5 extends PlainObj>(out: T1, inn1: T2, inn2: T3, inn3: T4, inn4: T5): T1 & T2 & T3 & T4 & T5;
export function assignRecursiveIn(out: PlainObj, ...ins: (PlainObj | AssignOptsRed)[]) {

    if (isAssignOptions(ins[ ins.length - 1 ]))
        return assignRecursiveInArray(out, ins.slice(-1) as any, ins[ ins.length - 1 ]);

    return assignRecursiveInArray(out, ins as any);
}


export function assignDefaultOption<T extends PlainObj>(defaultOption: T, option: PartialRecursive<T>, assignMode: AssignOpts = { assignMode: 'in', arrayMode: 'merge' }): T {

    return assignRecursiveArray({}, [ defaultOption, option ], assignMode);
}
