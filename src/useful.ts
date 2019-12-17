import findUp from 'find-up';
import path from 'path';
// chain(() => o.a.b.c) ==> if a prop doesn't exist ==> return defaultValue
export function chain<T>(exp: () => T, defaultValue: T = undefined) {
    try {
        /* const val = exp();
        if (val != null) {
            return val;
        } */
        return exp();
    } catch (e) {
        if (!(e instanceof ReferenceError || e instanceof TypeError))
            throw e;
    }
    return defaultValue;
}


export const findUpDir = (file: string) => findUp.sync(directory => {
    const hasPackageJson = findUp.sync.exists(path.join(directory, file));
    return hasPackageJson && directory;
}, { type: 'directory' });
