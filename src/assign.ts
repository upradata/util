/* eslint-disable no-redeclare */
import { objectToString } from './format-string';
import { PlainObj, PartialRecursive, Key, ObjectOf, MergeRecursive, InferArrayType } from './types';
import { isDefined, isNil, isUndefined } from './is';
import { Constructor } from './function';


export type AssignMode = 'of' | 'in';
export type ArrayMode = 'MergeRecursive' | 'replace' | 'concat';

export type AssignOpts = Partial<Omit<AssignOptions, 'onlyExistingProp' | 'nonRecursivelyAssignableTypes'> & {
    onlyExistingProp: boolean | { level: number; };
    nonRecursivelyAssignableTypes: Iterable<Constructor>;
    array: ArrayMode | 'primitive';
    object: 'own-properties' | 'all-prototype-chain';
}>;

export class AssignOptions {
    assignMode: AssignMode = 'of';
    arrayMode: ArrayMode = 'MergeRecursive';
    depth: number = NaN;
    onlyExistingProp: { level: number; };
    props: (string | symbol)[] = undefined;
    except: (string | symbol)[] = undefined;
    accept: (key: string | symbol, value: any) => boolean = undefined;
    transform: (key: string | symbol, value: any) => any = undefined;
    nonRecursivelyAssignableTypes: Set<Constructor>;
    isOption: boolean = true;

    constructor(options: AssignOpts = {}) {
        const opts = { ...options };

        if (opts.onlyExistingProp) {
            if (typeof opts.onlyExistingProp === 'boolean') {
                if (!opts.onlyExistingProp)
                    throw new Error(`onlyExistingProp option has to be true or { level: number }`);

                opts.onlyExistingProp = { level: Infinity };
            } else {
                opts.onlyExistingProp = { level: Infinity, ...opts.onlyExistingProp };
            }
        }

        opts.nonRecursivelyAssignableTypes = new Set([ RegExp, Date, ...(opts.nonRecursivelyAssignableTypes || []) ]);

        if (opts.array && !opts.arrayMode) {
            if (opts.arrayMode)
                throw new Error(`array option conflicts with arrayMode option`);

            opts.arrayMode = opts.array === 'primitive' ? 'replace' : opts.array;
        }

        if (opts.object) {
            if (opts.assignMode)
                throw new Error(`object option conflicts with assignMode option`);

            opts.assignMode = opts.object === 'own-properties' ? 'of' : 'in';
        }

        Object.assign(this, opts);
    }
}


const isAssignOptions = (v: any): v is AssignOptions => {
    return isDefined(v) && (v instanceof AssignOptions || v.isOption === true);
};


// If an object is created like so Object.create(null), the prototype is null and not Object.prototype
const hasOwnProperty = (o: object, prop: Key) => {
    return !isNil(Object.getPrototypeOf(o)) ? Object.prototype.hasOwnProperty.call(o, prop) : prop in o;
};


const isObjectOrArray = (v: any): v is any[] | ObjectOf<any> => typeof v === 'object' && v !== null;


class Assign {

    private options: AssignOptions;
    private currentlevel: number;

    constructor(private out: PlainObj, private ins: PlainObj[], options?: AssignOpts) {
        this.options = options instanceof AssignOptions ? options : new AssignOptions(options);
    }

    private lastLevel() {
        return !Number.isNaN(this.options.depth) && this.options.depth === 1;
    }

    private assignProp(prop: string, to: any, from: ObjectOf<any> | (() => any), outWasPrimitive: boolean) {
        const { onlyExistingProp, props, except, accept, transform } = this.options;

        const getFrom = () => {
            const v = typeof from === 'function' ? from() : from[ prop ];
            return isDefined(transform) ? transform(prop, v) : v;
        };

        if (except) {
            const property = this.findDotProp(prop, except) as string;
            if (property?.split('.').pop() === prop)
                return;
        }

        if (accept) {
            if (!accept(prop, getFrom()))
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

        const to = isObjectOrArray(out) ? out : {};
        const outIsPrimitive = fromPrimitive || isObjectOrArray(out);

        const isRecAssignable = (v: any) => ![ ...nonRecursivelyAssignableTypes ].some(ctor => v instanceof ctor);
        /*  typeof v === type || */ /* v.constructor === type */

        for (const inn of ins) {
            if (inn === undefined || inn === null || !isObjectOrArray(inn))
                continue;

            // eslint-disable-next-line guard-for-in
            for (const prop in inn) {

                if ((assignMode === 'of' && hasOwnProperty(inn, prop) || assignMode === 'in')) {

                    const isPropPrimitive = fromPrimitive || isObjectOrArray(to[ prop ]);

                    // recursion
                    if (isObjectOrArray(inn[ prop ]) && !this.lastLevel() && isRecAssignable(inn[ prop ])) { // array also
                        if (Array.isArray(inn[ prop ]) && arrayMode !== 'MergeRecursive') {
                            if (arrayMode === 'replace')
                                this.assignProp(prop, to, inn, isPropPrimitive);
                            else {
                                console.assert(arrayMode === 'concat');

                                if (isDefined(to[ prop ]) && !Array.isArray(to[ prop ]))
                                    throw new Error(`Error while assigning: property "${prop}" in ${objectToString(to)} is not an array (concat mode)`);

                                const toArr = isDefined(to[ prop ]) ? to[ prop ] : [];
                                this.assignProp(prop, to, { [ prop ]: toArr.concat(inn[ prop ]) }, isPropPrimitive);
                            }
                        } else {
                            const defaultTo = Array.isArray(inn[ prop ]) ? [] : {};
                            const options = { ...this.options, depth: depth - 1 };

                            this.assignProp(
                                prop,
                                to,
                                // callback to postpone
                                () => new Assign(
                                    isObjectOrArray(to[ prop ]) ? to[ prop ] : defaultTo, [ inn[ prop ] ],
                                    options
                                ).assignRecursive(currentLevel + 1, outIsPrimitive || isObjectOrArray(to[ prop ])),
                                isPropPrimitive
                            );
                        }
                    } else
                        // normal case
                        this.assignProp(prop, to, inn, outIsPrimitive);
                }
            }
        }

        return to;
    }

}


const splitArgs = <T extends {}>(args: [ ...T[], T | AssignOpts ]) => {
    const [ out, ...ins ] = args;

    if (isAssignOptions(ins[ ins.length - 1 ])) {
        const options = ins[ ins.length - 1 ];
        return { out, ins: ins.slice(0, -1), options };
    }

    return { out, ins, options: undefined };
};


export function assignRecursiveArray<O extends {}, T extends {}>(out: O, ins: T[], options: AssignOpts = {}): MergeRecursive<O | T> {
    return new Assign(out, ins, options).assignRecursive() as any;
}


export function assignRecursive<T extends any[]>(...args: T): MergeRecursive<InferArrayType<T>>;
export function assignRecursive<T extends any[]>(...args: [ ...T, AssignOpts ]): MergeRecursive<T> {
    const { out, ins, options } = splitArgs(args);
    return assignRecursiveArray(out, ins, options) as any;
}

type AssignOptsWithoutAssignMode = Omit<AssignOpts, 'assignMode'>;

export function assignRecursiveInArray<O extends {}, T extends {}>(out: O, ins: T[], options: AssignOptsWithoutAssignMode = {}): MergeRecursive<O | T> {
    return assignRecursiveArray(out, ins, { ...options, assignMode: 'in' }) as any;
}


export function assignRecursiveIn<T extends any[]>(...args: T): MergeRecursive<InferArrayType<T>>;
export function assignRecursiveIn<T extends any[]>(...args: [ ...T, AssignOptsWithoutAssignMode ]): MergeRecursive<InferArrayType<T>> {
    const { out, ins, options } = splitArgs(args);
    return assignRecursiveInArray(out, ins, options) as any;
}


export function assignDefaultOption<T extends {}>(defaultOption: T, option: PartialRecursive<T>, assignMode: AssignOpts = { assignMode: 'in', arrayMode: 'MergeRecursive' }): T {
    return assignRecursiveArray({}, [ defaultOption, option ], assignMode) as any;
}
