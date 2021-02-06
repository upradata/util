import { ToString } from './type';

export const arrayToString = <T extends ToString>(arr: T[], sep = ', ') => `[ ${arr.join(sep)} ]`;
export const objectToString = (obj: object, indent = 4): string => JSON.stringify(obj, (_k, v) => Array.isArray(v) ? arrayToString(v) : v, indent);
