import { Observable, Operator, Subscriber, TeardownLogic, OperatorFunction } from 'rxjs';
import { subscribeToResult } from 'rxjs/util/subscribeToResult';
import { InnerSubscriber, OuterSubscriber } from 'rxjs/internal-compatibility';
import { PartialRecursive } from '../type';


export abstract class Cumulator<T> {
    abstract clear(): void;
    abstract add(value: T): void;
    abstract toArray?(): T[];
}

export interface CumulatorCtor<T> {
    new(): Cumulator<T>;
}


export class CumulateOptions<T> {
    cumulate: <T>(value: T) => boolean = value => true;
}

export type CumulateOpts<T> = PartialRecursive<CumulateOptions<T>>;

// Inspiried by /home/milottit/GithubProjects/rxjs/src/internal/operators/buffer.ts
export function cumulate<T>(closingNotifier: Observable<any>, cumulator: CumulatorCtor<T> | Cumulator<T>, options?: CumulateOpts<T>): OperatorFunction<T, T[]> {
    return function operator(source: Observable<T>): Observable<T[]> {
        return source.lift(new class UniqueBufferOperator<T> implements Operator<T, T[]> {
            call(subscriber: Subscriber<T[]>, source: any): TeardownLogic {
                return source.subscribe(new UniqueBufferSubscriber({ destination: subscriber, closingNotifier, cumulator, options }));
            }
        });
    };
}




class UniqueBufferSubscriber<T> extends OuterSubscriber<T, any> {

    cumulator: Cumulator<T>;
    options: CumulateOptions<T>;

    constructor(args: {
        destination: Subscriber<T[]>; closingNotifier: Observable<any>;
        cumulator: CumulatorCtor<any> | Cumulator<any>;
        options?: CumulateOpts<T>;
    }) {
        super(args.destination);
        const { cumulator, closingNotifier } = args;
        this.options = Object.assign(new CumulateOptions(), args.options);

        this.cumulator = cumulator instanceof Cumulator ? cumulator : new cumulator();
        this.add(subscribeToResult(this, closingNotifier));
    }

    protected _next(value: T) {
        if (this.options.cumulate(value))
            this.cumulator.add(value);
    }

    notifyNext(outerValue: T, innerValue: any, outerIndex: number, innerIndex: number, innerSub: InnerSubscriber<T, any>): void {
        const cumulate = this.cumulator[ Symbol.iterator ] ? [ ...this.cumulator[ Symbol.iterator ]() ] : this.cumulator.toArray();
        this.cumulator.clear();

        this.destination.next(cumulate);
    }
}


export const cumulateUnique = <T>(closingNotifier: Observable<any>, options?: CumulateOpts<T>) => cumulate<T>(closingNotifier, Set, options);
