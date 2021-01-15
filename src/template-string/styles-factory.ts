import { ObjectOf, PickType } from '../type';
import { StyleTransform, Style, StyleFlatten } from './style';
import { CommonTagStyle } from './helpers/common-tags.type';
import * as commonTags from 'common-tags';
import { recreateString, ToString } from './template-string';
import { keys, makeObject } from '../useful';


export const buildStyle = <S extends ObjectOf<StyleTransform | Style>>(names: Array<string | number>, styleFactories: S, flatten?: StyleFlatten) => {

    for (const k of names) {

        Object.defineProperty(Style.prototype, k, {
            // tslint:disable-next-line:object-literal-shorthand
            get: function (this: Style) {
                // this will allow syntax red.bgYellow.underline.$ 
                return new Style({ transforms: [ this, styleFactories[ k ] ], flatten });
            }
        });
    }
};



export type CommonTagsStringTranform = PickType<CommonTagStyle, StyleTransform>;
export type DefinedStringTransforms = CommonTagsStringTranform /* & OtherClasses if we went to add other transform builders*/;


export type Styles<AllTransforms> = Style & {
    [ K in keyof AllTransforms ]: Styles<AllTransforms> & Style;
};


export const transformToStyleTemplate = (transform: (arg: any) => string) => (strings: TemplateStringsArray, ...keys: ToString[]) => transform(recreateString(strings, ...keys));


const commonTagsKeys = keys(new CommonTagStyle());
buildStyle(commonTagsKeys, makeObject(commonTagsKeys, k => commonTags[ k ]));

export const styles = new Style() as Styles<DefinedStringTransforms>;
