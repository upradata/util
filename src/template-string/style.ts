import { recreateString } from './recreate-string';

export type StyleTransform<T = any, R = T> = (...args: T[]) => R;
export type StyleTransformString<T = any> = (s: string) => T;
export type StyleMode = 'args' | 'full' | 'both' | 'null';


export type StyleTemplate<T = any, K = any> = (strings: TemplateStringsArray, ...keys: K[]) => T;
export type StyleFlatten = (strings: TemplateStringsArray, ...keys: any[]) => any;

export class StyleOptions {
    flatten?: StyleFlatten;
    flattenIfNoTransforms?: StyleFlatten;
    mode?: StyleMode;
    transforms?: Style[ 'transforms' ];
}


// const flatMap = (arr: any[]) => arr.reduce((a, v) => a.concat(Array.isArray(v) ? flatMap(v) : v), []);

export class Style {
    static get [ Symbol.species ]() { return Style; }
    public transforms: Array<StyleTransform | { mode: StyleMode; transform: StyleTransform; } | Style> = [];
    public mode: StyleMode = undefined;
    public flatten?: StyleFlatten = undefined;
    flattenIfNoTransforms?: StyleFlatten = undefined;


    constructor(public options: StyleOptions = {}) {
        this.mode = options.mode || 'null';
        this.flatten = options.flatten;
        this.flattenIfNoTransforms = options.flattenIfNoTransforms;

        if (options.transforms)
            this.add(...options.transforms);
    }

    get args() {
        this.mode = 'args';
        return this;
    }

    get full() {
        this.mode = 'full';
        return this;
    }

    get both() {
        this.mode = 'both';
        return this;
    }

    private getTransforms(level: number = 0): Array<{ mode: StyleMode; transform: StyleTransform; }> {
        const transforms = /* flatMap( */this.transforms.flatMap(tr => {
            if (tr instanceof Style) return tr.getTransforms(level + 1);
            if (typeof tr === 'function') return { mode: this.mode || 'null' as const, transform: tr };
            return tr;
        }); // );

        const setMode = (t: { mode: StyleMode; transform: StyleTransform; }, i: number) => {

            if (i === transforms.length - 1 && t.mode === 'null' && level === 0)
                t.mode = this.mode === 'null' ? 'full' : this.mode;

            if (t.mode !== 'null') {
                for (let j = i - 1; j >= 0; --j) {
                    if (transforms[ j ].mode !== 'null')
                        break;

                    transforms[ j ].mode = t.mode;
                }
            }

            return t;
        };

        return transforms.map(setMode);
    }


    add(...transforms: StyleOptions[ 'transforms' ]): Style {
        this.transforms = [ ...this.transforms, ...transforms ];
        return this;
    }

    copy<T>(): T {
        return new this.constructor[ Symbol.species ](this);
    }

    get p() {
        return '';
    }

    get $() {
        return this.styleTemplate();
    }

    $$<T = any>(s: string): T {
        return this.styleTemplate()`${s}`;
    }

    get transform() {
        return (s: string) => this.$$(s);
    }

    private isArgsMode(mode: StyleMode) {
        return [ 'args', 'both' ].some(m => m === mode);
    }

    private isFullMode(mode: StyleMode) {
        return [ 'full', 'both' ].some(m => m === mode);
    }

    protected styleTemplate(): StyleTemplate {
        return (strings: TemplateStringsArray, ...keys: any[]) => {
            const newKeys = this.applyTransformsToKeys(...keys);

            if (this.flatten) {
                const flatten = this.flatten(strings, ...newKeys);
                return this.applyTransforms(flatten) ?? flatten;
            }

            return this.applyTransforms(strings, ...newKeys);
        };
    }

    public applyTransformsToKeys(...keys: any[]) {
        const transforms = this.getTransforms().filter(t => this.isArgsMode(t.mode));
        if (transforms.length === 0)
            return keys;

        return keys.map(k => {
            return transforms.reduce((prev, t) => t.transform(prev), k);
        });
    }

    public applyTransforms(...args: any[]) {
        const transforms = this.getTransforms().filter(t => this.isFullMode(t.mode)).map(t => t.transform);

        if (transforms.length === 0) {
            if (this.flattenIfNoTransforms)
                transforms.push(this.flattenIfNoTransforms);
            else
                return undefined;
        }

        return transforms.reduce((prev, transform) => Array.isArray(prev) ? transform(...prev) : transform(prev), args);
    }
}


export const stringify = new Style({ flatten: recreateString });
export const flattenStringStyle = stringify;

export function style(...transforms: StyleOptions[ 'transforms' ]) {
    return new Style({ transforms });
}
