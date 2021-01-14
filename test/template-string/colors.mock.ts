import { keys, makeObject } from '../../src/useful';
import { buildStyle, DefinedStringTransforms, recreateString, Styles, StyleTransform, styles as s } from '../../src/template-string';
import { PickType } from '../../src/type';

export class Colors<T = any> {
    none: T = undefined;
    reset: T = undefined;
    bold: T = undefined;
    dim: T = undefined;
    italic: T = undefined;
    underline: T = undefined;
    inverse: T = undefined;
    hidden: T = undefined;
    strikethrough: T = undefined;
    black: T = undefined;
    red: T = undefined;
    green: T = undefined;
    yellow: T = undefined;
    blue: T = undefined;
    magenta: T = undefined;
    cyan: T = undefined;
    white: T = undefined;
    gray: T = undefined;
    grey: T = undefined;
    bgBlack: T = undefined;
    bgRed: T = undefined;
    bgGreen: T = undefined;
    bgYellow: T = undefined;
    bgBlue: T = undefined;
    bgMagenta: T = undefined;
    bgCyan: T = undefined;
    bgWhite: T = undefined;
    blackBG: T = undefined;
    redBG: T = undefined;
    greenBG: T = undefined;
    yellowBG: T = undefined;
    blueBG: T = undefined;
    magentaBG: T = undefined;
    cyanBG: T = undefined;
    whiteBG: T = undefined;
}


export const colorsTransforms = makeObject(Colors, k => (s: string) => `<${k}>${s}</${k}>`);

const props = keys(new Colors());
buildStyle(props, colorsTransforms, recreateString);

export const styles = s as Styles<DefinedStringTransforms & PickType<Colors, StyleTransform>>;
export const colors = makeObject(Colors, k => styles[ k ].$);
