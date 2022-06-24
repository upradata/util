export interface CodifiedErrorArgs<ErrorsEnum> {
    code?: ErrorsEnum;
    message?: string;
    name?: string;
    details?: any;
    list?: CodifiedError<any>[];
}

export type ErrorKeys = keyof Error | keyof CodifiedErrorArgs<any>;


export class CodifiedError<ErrorsEnum = string> extends Error {
    code?: ErrorsEnum;
    details?: any;
    list: CodifiedError<any>[] = [];

    constructor(args: CodifiedErrorArgs<ErrorsEnum> = {}) {
        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        // https://stackoverflow.com/questions/41102060/typescript-extending-error-class
        /*
        The problem is that Javascript's built-in class Error breaks the prototype chain by switching the object to be constructed
        (i.e. this) to a new, different object, when you call super and that new object doesn't have the expected prototype chain,
        i.e. it's an instance of Error not of CodifiedError.

         This is because when you call Error as a function (rather than via new or, in ES2015, super or Reflect.construct), it ignores this and creates a new Error.
        */

        // 'Error' breaks prototype chain here
        super(args.message || '');

        // restore prototype chain
        const actualProto = new.target.prototype;

        if (Object.setPrototypeOf)
            Object.setPrototypeOf(this, actualProto);
        else {
            // eslint-disable-next-line no-proto
            (this as any).__proto__ = actualProto;
        }

        // Capture stack trace
        if (!this.stack) {
            Error.captureStackTrace(this, this.constructor);
        }

        Object.assign(this, { name: this.constructor.name } as Partial<CodifiedErrorArgs<ErrorsEnum>>, args);
    }

    copy(keyFilter: (k: ErrorKeys) => boolean) {

        // Apparently message is not loopable (even if I put the property inside the child class!!!)
        return [ ...Object.entries(this), [ 'message', this.message ] ]
            .filter(([ k, v ]) => keyFilter(k as ErrorKeys) && v)
            .reduce((o, [ k, v ]) => ({ ...o, [ k ]: v }), {});
    }

    toString(withStack: boolean = false) {
        const message = (e: CodifiedError) => {
            const code = e.code ? `code: ${e.code}` : '';
            const details = e.details ? `details: ${typeof e.details === 'object' ? JSON.stringify(e.details) : e.details}` : '';
            const message = e.message ? `message: ${e.message}` : '';
            const stack = e.stack && withStack ? e.stack : '';

            return [ code, message, details, stack ].filter(s => s !== '').join('\n');
        };

        const walkErrors = (e: CodifiedError<any>, str: string): string => {
            const messageReducer = [ str, message(e) ].filter(s => s !== '').join('\n');
            return e.list.reduce((s, err) => walkErrors(err, s), messageReducer);
        };

        return walkErrors(this, '');
    }
}

export enum CommonErrors {
    BAD_ARGUMENT = 'error/bad-argument',
    UNEXPECTED_VALUE = 'error/unexpected-value',
}
