export interface CodifiedErrorArgs<ErrorsEnum> {
    code: ErrorsEnum;
    message: string;
    name?: string;
    details?: any;
    list?: CodifiedError<any>[];
}


export class CodifiedError<ErrorsEnum = string> extends Error {
    code: ErrorsEnum;
    details?: any;
    list?: CodifiedError<any>[];

    constructor(args: CodifiedErrorArgs<ErrorsEnum>) {
        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        // https://stackoverflow.com/questions/41102060/typescript-extending-error-class
        /*
        The problem is that Javascript's built-in class Error breaks the prototype chain by switching the object to be constructed
        (i.e. this) to a new, different object, when you call super and that new object doesn't have the expected prototype chain,
        i.e. it's an instance of Error not of CodifiedError.

         This is because when you call Error as a function (rather than via new or, in ES2015, super or Reflect.construct), it ignores this and creates a new Error.
        */

        // 'Error' breaks prototype chain here
        super(args.message);

        // restore prototype chain
        const actualProto = new.target.prototype;

        if (Object.setPrototypeOf) { Object.setPrototypeOf(this, actualProto); }
        else { (this as any).__proto__ = actualProto; }

        this.message = args.message;
        this.code = args.code;
        this.name = args.name || this.constructor.name;
        this.details = args.details;
        this.list = args.list;
    }

    copy(keyFilter: (k: string) => boolean) {
        const o = {};

        // Apparently message is not loopable (even if I put the property inside the child class!!!)
        for (const [ k, v ] of [ ...Object.entries(this), [ 'message', this.message ] ]) {
            if (keyFilter(k) && v)
                o[ k ] = v;
        }

        return o;
    }
}

export enum CommonErrors {
    BAD_ARGUMENT = 'error/bad-argument',
    UNEXPECTED_VALUE = 'error/unexpected-value',
}
