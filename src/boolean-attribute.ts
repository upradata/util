export class BooleanAttribute {
    static getBoolean(value: boolean | string) {
        const v = value === undefined ? false : value;
        return typeof v === 'boolean' ? v : true;
    }

} 
