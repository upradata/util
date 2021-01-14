import { Style, CommonTagStyleList, recreateString } from '../../src/template-string';
import * as commonTags from 'common-tags';
import { keys } from '../../src/useful';
import { styles, Colors, colors, colorsTransforms } from './colors.mock';

describe('Test suite template string styles', () => {

    it('all basic styles should be initialized', () => {
        for (const k of keys(new Colors())) {
            expect(styles[ k ]).toBeDefined();
            expect(styles[ k ]).toBeInstanceOf(Style);
            expect(styles[ k ].transforms.length).toEqual(2);
            expect(styles[ k ].transforms[ 0 ]).toBeInstanceOf(Style);
            expect(styles[ k ].transforms[ 1 ].toString()).toEqual(colorsTransforms[ k ].toString());
        }
    });

    it('all common tags styles should be initialized', () => {
        for (const k of keys(new CommonTagStyleList())) {
            expect(styles[ k ]).toBeDefined();
            expect(styles[ k ]).toBeInstanceOf(Style);
            expect(styles[ k ].transforms.length).toEqual(2);
            expect(styles[ k ].transforms[ 0 ]).toBeInstanceOf(Style);
            expect(styles[ k ].transforms[ 1 ].toString()).toEqual(commonTags[ k ].toString());
        }
    });


    it('should cumulate styles', () => {
        const s1 = styles.yellow;
        const s2 = s1.blueBG;
        const s3 = s2.blue;
        const s4 = s3.bgCyan;
        const s5 = s4.red;

        expect(s1.transforms.length).toEqual(2);
        expect(s1[ 'getTransforms' ]().length).toEqual(1);

        expect(s2.transforms.length).toEqual(2);
        expect(s2[ 'getTransforms' ]().length).toEqual(2);

        expect(s3.transforms.length).toEqual(2);
        expect(s3[ 'getTransforms' ]().length).toEqual(3);

        expect(s4.transforms.length).toEqual(2);
        expect(s4[ 'getTransforms' ]().length).toEqual(4);

        expect(s5.transforms.length).toEqual(2);
        expect(s5[ 'getTransforms' ]().length).toEqual(5);

        expect(styles.red).not.toBe(styles.red.red);
    });

    it('shoudl generate the right mode', () => {
        expect(styles.red.bold.bgWhite[ 'getTransforms' ]()).toMatchObject([
            { mode: 'full' }, { mode: 'full' }, { mode: 'full' },
        ]);

        expect(styles.red.bold.bgWhite.args[ 'getTransforms' ]()).toMatchObject([
            { mode: 'args' }, { mode: 'args' }, { mode: 'args' },
        ]);

        expect(styles.red.bold.args.bgWhite.yellow.both.magenta[ 'getTransforms' ]()).toMatchObject([
            { mode: 'args' }, { mode: 'args' },
            { mode: 'both' }, { mode: 'both' },
            { mode: 'full' }
        ]);

        expect(styles.red.bold.args.bgWhite.yellow[ 'getTransforms' ]()).toMatchObject([
            { mode: 'args' }, { mode: 'args' },
            { mode: 'full' }, { mode: 'full' },
        ]);

        expect(styles.red.bold.bgWhite.args.oneLineTrim.yellow.full[ 'getTransforms' ]()).toMatchObject([
            { mode: 'args' }, { mode: 'args' }, { mode: 'args' },
            { mode: 'full' }, { mode: 'full' },
        ]);
    });

    it('should display the good color', () => {

        const y = styles.yellow;

        expect(y.bgBlue.$`PIPI est bon`).toBe('<bgBlue><yellow>PIPI est bon</yellow></bgBlue>');
        expect(y.bgMagenta.$`PIPI est bon`).toBe('<bgMagenta><yellow>PIPI est bon</yellow></bgMagenta>');
        expect(y.bgBlue.$`PIPI est bon`).toBe('<bgBlue><yellow>PIPI est bon</yellow></bgBlue>');

        expect(styles.red.$`caca est bon`).toBe('<red>caca est bon</red>');


        expect(`caca ${styles.red.$`de merde`} est ${styles.yellow.$`yellow`} bon`).toBe('caca <red>de merde</red> est <yellow>yellow</yellow> bon');
        expect(styles.red.args.$`caca ${11} est ${22} bon`).toBe('caca <red>11</red> est <red>22</red> bon');
        expect(styles.red.$`caca ${styles.yellow.$`YELLOW`} est ${styles.blue.bgWhite.$`SURPRISE`} bon`)
            .toBe('<red>caca <yellow>YELLOW</yellow> est <bgWhite><blue>SURPRISE</blue></bgWhite> bon</red>');


        const s = new Style();
        const stylish = s.add(recreateString, colorsTransforms.red, colorsTransforms.bold, colorsTransforms.bgWhite).$;
        expect(stylish`caca est bon`).toBe('<bgWhite><bold><red>caca est bon</red></bold></bgWhite>');

        const s2 = new Style({ flatten: recreateString });
        const stylish2 = s2.add(colorsTransforms.red, colorsTransforms.bold, colorsTransforms.bgWhite).$;
        expect(stylish2`caca est bon`).toBe('<bgWhite><bold><red>caca est bon</red></bold></bgWhite>');

        const s3 = new Style({ flatten: recreateString });
        const stylish3 = s3.add(colorsTransforms.red, colorsTransforms.bold, colorsTransforms.bgWhite).args.$;
        expect(stylish3`caca ${11} est ${22} bon`).toBe('caca <bgWhite><bold><red>11</red></bold></bgWhite> est <bgWhite><bold><red>22</red></bold></bgWhite> bon');

        const s4 = new Style();
        const stylish4 = s4.add(styles.red.args, styles.bold.args, styles.bgWhite.args, styles.oneLineTrim.full).$;
        expect(stylish4`caca 
                    ${11} 
                    est 
                    ${22} 
                    bon`).toBe('caca <bgWhite><bold><red>11</red></bold></bgWhite> est <bgWhite><bold><red>22</red></bold></bgWhite> bon');

        expect(styles.red.bold.bgWhite.args.oneLineTrim.full.$`caca 
                    ${11} 
                    est 
                    ${22} 
                    bon`).toBe('caca <bgWhite><bold><red>11</red></bold></bgWhite> est <bgWhite><bold><red>22</red></bold></bgWhite> bon');


        expect(styles.yellow.bold.bgWhite.$`caca est bon2`).toBe('<bgWhite><bold><yellow>caca est bon2</yellow></bold></bgWhite>');

        const highlightArgs = styles.bold.yellow.args.$;
        expect(highlightArgs`Attention l'${'argument'} est ${'highlited'} :)))`).toBe(`Attention l'<yellow><bold>argument</bold></yellow> est <yellow><bold>highlited</bold></yellow> :)))`);

        const caca = 'red';
        const bon = 'yellow';
        expect(`caca ${styles.red.$`${caca}`} est ${styles.yellow.$`${bon}`} bon`).toBe('caca <red>red</red> est <yellow>yellow</yellow> bon');

        const same = 'red';
        expect(styles.red.args.$`caca ${same} est ${same} bon`).toBe('caca <red>red</red> est <red>red</red> bon');

        expect(styles.red.$$('As a function')).toBe('<red>As a function</red>');

        expect(colors.red`red`).toBe('<red>red</red>');
        expect(colors.yellow`yellow`).toBe('<yellow>yellow</yellow>');
    });


    it('should be the common tag output', () => {
        expect(styles.oneLineTrim.$`a
                b
        c`).toBe(commonTags.oneLineTrim`a
                b
        c`);

        expect(styles.oneLineCommaListsOr.$`a ${[ 1, 2, 3, 4 ]}
        b`).toBe(commonTags.oneLineCommaListsOr`a ${[ 1, 2, 3, 4 ]}
        b`);
    });
});
