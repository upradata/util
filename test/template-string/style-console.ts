import { oneLineTrim } from 'common-tags';
import { styles, colors, colorsTransforms } from './colors.mock';
import { recreateString, stripIndent, Style } from '../../src/template-string';

const y = styles.yellow;

console.log(y.bgBlue.$`PIPI est bon`);
console.log(y.bgMagenta.$`PIPI est bon`);
console.log(y.bgBlue.$`PIPI est bon`);

console.log(styles.red.$`caca est bon`);

console.log(`caca ${styles.red.$`de merde`} est ${styles.yellow.$`yellow`} bon`);
console.log(styles.red.args.$`caca ${11} est ${22} bon`);
console.log(styles.red.$`caca ${styles.yellow.$`YELLOW`} est ${styles.blue.bgWhite.$`SURPRISE`} bon`);


const s = new Style();
const stylish = s.add(recreateString, colorsTransforms.red, colorsTransforms.bold, colorsTransforms.bgWhite).$;
console.log(stylish`caca est bon`);

const s2 = new Style({ flatten: recreateString });
const stylish2 = s2.add(colorsTransforms.red, colorsTransforms.bold, colorsTransforms.bgWhite).$;
console.log(stylish2`caca est bon`);

const s3 = new Style({ flatten: recreateString });
const stylish3 = s3.add(colorsTransforms.red, colorsTransforms.bold, colorsTransforms.bgWhite).args.$;
console.log(stylish3`caca ${11} est ${22} bon`);

const s4 = new Style();
const stylish4 = s4.add(styles.red.args, styles.bold.args, styles.bgWhite.args, styles.oneLineTrim.full).$;
console.log(stylish4`caca 
                    ${11} 
                    est 
                    ${22} 
                    bon`);

console.log(styles.red.bold.bgWhite.args.oneLineTrim.full.$`caca 
                    ${11} 
                    est 
                    ${22} 
                    bon`);


console.log(styles.yellow.bold.bgWhite.$`caca est bon2`);

const highlightArgs = styles.bold.yellow.args.$;
console.log(highlightArgs`Attention l'${'argument'} est ${'highlited'} :)))`);

const caca = 'red';
const bon = 'yellow';
console.log(`caca ${styles.red.$`${caca}`} est ${styles.yellow.$`${bon}`} bon`);
const same = 'red';
console.log(styles.red.args.$`caca ${same} est ${same} bon`);


console.log(styles.red.$$('As a function'));


console.log(colors.red`red`);
console.log(colors.yellow`yellow`);
console.log(oneLineTrim`one
                Line`);
console.log(styles.oneLineTrim.$`one
                Line`);
console.log(stripIndent`
                        1
                            2
                        3
                        4`);
