import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PlainObj } from './type';

export interface State {
    obj: PlainObj;
    tmpState: Partial<PlainObj>;
}

export class ExecuteOnTempState {
    private oldState: PlainObj;
    private obj: PlainObj;
    private tmpState: PlainObj;

    constructor(state?: State) {
        this.state(state);
    }

    private backAndReturn<Return>(ret: Return) {
        Object.assign(this.obj, this.oldState);
        return ret;
    }

    from(obj: PlainObj) {
        this.obj = obj;
        return this;
    }

    to(tmpState: Partial<PlainObj>) {
        this.tmpState = tmpState;
        return this;
    }

    state(state: State) {
        Object.assign(this, state);
        return this;
    }

    execute<R>(syncOrAsyncAction: (tmp?: PlainObj) => R): R {
        this.oldState = {};

        for (const k of Object.keys(this.tmpState))
            this.oldState[ k ] = this.obj[ k ];

        Object.assign(this.obj, this.tmpState);

        /// start ///
        const r = syncOrAsyncAction.call(this.obj, this.obj);

        if (r instanceof Promise)
            return (r as Promise<any>).then(ret => this.backAndReturn(ret)) as any as R;

        if (r instanceof Observable)
            return (r as Observable<any>).pipe(tap(ret => this.backAndReturn(ret))) as any as R;

        return this.backAndReturn(r);
    }
}


export function temp(obj: PlainObj) {
    return new ExecuteOnTempState().from(obj);
}
