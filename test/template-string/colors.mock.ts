import { keys, makeObject } from '../../src/object';
import { buildStyle, DefinedStringTransforms, Styles, StyleTransform, styles as s } from '../../src/template-string';
import type { PickType } from '../../src/types';

export class Colors<T = any> {
    none: T = undefined as T;
    reset: T = undefined as T;
    bold: T = undefined as T;
    dim: T = undefined as T;
    italic: T = undefined as T;
    underline: T = undefined as T;
    inverse: T = undefined as T;
    hidden: T = undefined as T;
    strikethrough: T = undefined as T;
    black: T = undefined as T;
    red: T = undefined as T;
    green: T = undefined as T;
    yellow: T = undefined as T;
    blue: T = undefined as T;
    magenta: T = undefined as T;
    cyan: T = undefined as T;
    white: T = undefined as T;
    gray: T = undefined as T;
    grey: T = undefined as T;
    bgBlack: T = undefined as T;
    bgRed: T = undefined as T;
    bgGreen: T = undefined as T;
    bgYellow: T = undefined as T;
    bgBlue: T = undefined as T;
    bgMagenta: T = undefined as T;
    bgCyan: T = undefined as T;
    bgWhite: T = undefined as T;
    blackBG: T = undefined as T;
    redBG: T = undefined as T;
    greenBG: T = undefined as T;
    yellowBG: T = undefined as T;
    blueBG: T = undefined as T;
    magentaBG: T = undefined as T;
    cyanBG: T = undefined as T;
    whiteBG: T = undefined as T;
}


export const colorsTransforms = makeObject(Colors, k => (s: string) => `<${k}>${s}</${k}>`);

const props = keys(new Colors());

buildStyle(props, makeObject(props, k => ({ transforms: [ colorsTransforms[ k ] ] })));

export const styles = s as Styles<DefinedStringTransforms & PickType<Colors, StyleTransform>>;
export const colors = makeObject(Colors, k => styles[ k ].$);
