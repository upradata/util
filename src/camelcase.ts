export function preserveCamelCase(text: string) {
    let string = text;
    let isLastCharLower = false;
    let isLastCharUpper = false;
    let isLastLastCharUpper = false;

    for (let i = 0; i < string.length; i++) {
        const character = string[ i ];

        if (isLastCharLower && /[a-zA-Z]/.test(character) && character.toUpperCase() === character) {
            string = string.slice(0, i) + '-' + string.slice(i);
            isLastCharLower = false;
            isLastLastCharUpper = isLastCharUpper;
            isLastCharUpper = true;
            i++;
        } else if (isLastCharUpper && isLastLastCharUpper && /[a-zA-Z]/.test(character) && character.toLowerCase() === character) {
            string = string.slice(0, i - 1) + '-' + string.slice(i - 1);
            isLastLastCharUpper = isLastCharUpper;
            isLastCharUpper = false;
            isLastCharLower = true;
        } else {
            isLastCharLower = character.toLowerCase() === character && character.toUpperCase() !== character;
            isLastLastCharUpper = isLastCharUpper;
            isLastCharUpper = character.toUpperCase() === character && character.toLowerCase() !== character;
        }
    }

    return string;
}

export function camelCase(text: string | string[], opts?: { pascalCase?: boolean; }) {
    if (!(typeof text === 'string' || Array.isArray(text))) {
        throw new TypeError('Expected the input to be `string | string[]`');
    }

    let input = Array.isArray(text) ? [ ...text ] : text;

    const options = Object.assign({
        pascalCase: false
    }, opts);

    const postProcess = x => options.pascalCase ? x.charAt(0).toUpperCase() + x.slice(1) : x;

    if (Array.isArray(input)) {
        input = input.map(x => x.trim())
            .filter(x => x.length)
            .join('-');
    } else {
        input = input.trim();
    }

    if (input.length === 0) {
        return '';
    }

    if (input.length === 1) {
        return options.pascalCase ? input.toUpperCase() : input.toLowerCase();
    }

    const hasUpperCase = input !== input.toLowerCase();

    if (hasUpperCase) {
        input = preserveCamelCase(input);
    }

    input = input
        .replace(/^[_.\- ]+/, '')
        .toLowerCase()
        // .replace(/[_.\- ]+(\w|$)/g, (_, p1) => p1.toUpperCase())
        .replace(/[_\- ]+(\w|$)/g, (_, p1) => p1.toUpperCase())
        .replace(/\d+(\w|$)/g, m => m.toUpperCase());

    return postProcess(input);
};