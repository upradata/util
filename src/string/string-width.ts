import emojiRegex from 'emoji-regex';
import isFullwidthCodePoint from './is-fullwidth-code-point';

// ANSI escapes are the terminal codes to add color/bell, ...
// https://en.wikipedia.org/wiki/ANSI_escape_code

// copied from node_modules/ansi-regex and strp-ansi because there were not in CommonJS and also not well written

const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
].join('|');

export const ansiRegex = ({ onlyFirst = false } = {}) => new RegExp(pattern, onlyFirst ? undefined : 'g');


export const stripAnsi = (s: string) => {
    if (typeof s === 'string')
        return s.replace(ansiRegex(), '');

    throw new TypeError(`Expected a "string", got "${typeof s}"`);
};


// copied from node_modules/string-width and rewritten better
// plus, string-width is using ES6 import only

const getWidth = (s: string) => function computeWidth(width = 0, index = 0): number {
    if (index === s.length)
        return width;

    const codePoint = s.codePointAt(index);

    // Ignore control characters
    if (codePoint <= 0x1F || (codePoint >= 0x7F && codePoint <= 0x9F)) {
        return computeWidth(width, index + 1);
    }

    // Ignore combining characters
    if (codePoint >= 0x300 && codePoint <= 0x36F) {
        return computeWidth(width, index + 1);
    }

    // Surrogates
    const shiftIndex = codePoint > 0xFFFF ? 2 : 1;
    const codeWith = isFullwidthCodePoint(codePoint) ? 2 : 1;

    return computeWidth(width + codeWith, index + shiftIndex);
};


export const stringWidth = (s: string): number => {
    if (typeof s !== 'string' || s.length === 0)
        return 0;

    const string = stripAnsi(s);

    if (string.length === 0)
        return 0;

    const processWidth = getWidth(string.replace(emojiRegex(), '  '));
    return processWidth();
};
