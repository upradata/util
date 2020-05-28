export const EMAIL_REGEXP = /^[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export const regexToString = (r: string | RegExp) => typeof r === 'string' ? r : r.source;
export const stringToRegex = (r: string | RegExp, flags?: string) => typeof r === 'string' ? new RegExp(r, flags) : r;
export const mergeRegexes = (...regexes: (RegExp | string)[]) => new RegExp(regexes.map(r => `(${regexToString(r)})`).join('|'));
export const mergeRegexesWithFlags = (...regexes: (RegExp | string)[]) => new RegExp(
    regexes.slice(0, -1).map(r => `(${regexToString(r)})`).join('|'),
    regexes.slice(-1)[ 0 ] as string
);
