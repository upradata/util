type AsyncFunc<T> = () => Promise<T>;

export class PromisePool<T = unknown> {
    public size: number;
    private result = new Map<number, T>();
    private pool = new Map<AsyncFunc<T>, Promise<void> /* return value */>();
    private queue: AsyncFunc<T>[] = [];
    private i: number = -1;
    private isDoneCalled: boolean = false;
    private resolve: Function;

    constructor(options: { size?: number; } = {}) {
        this.size = options.size || 3;
    }

    private queueEmpty() {
        if (this.resolve)
            this.resolve();
    }

    public execute(asyncFunc: AsyncFunc<T>) {
        this.queue.push(asyncFunc);
        this.next();
    }

    private next() {
        if (this.pool.size < this.size && this.queue.length > 0) {
            const asyncFunc = this.queue.pop();

            ++this.i;
            const { i } = this;

            this.pool.set(asyncFunc,
                asyncFunc().then(res => {
                    this.pool.delete(asyncFunc);
                    this.result.set(i, res);

                    if (this.queue.length === 0 && this.isDoneCalled && this.i === this.result.size - 1)
                        this.queueEmpty();
                    else
                        this.next();
                })
            );
        }
    }

    public done(): Promise<T[]> {
        this.isDoneCalled = true;

        return new Promise<T[]>((res, _rej) => {
            this.resolve = () => {
                // result in order
                res([ ...this.result.values() ]);
            };

            if (this.queue.length === 0 && this.i === this.result.size - 1)
                this.resolve();
        });
    }
}

/* const pool = new PromisePool();

function wait(i, ms) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res(i);
        }, ms);

    });
}

pool.execute(wait.bind(null, 0, 1000));
pool.execute(wait.bind(null, 1, 500));
pool.execute(wait.bind(null, 2, 400));
pool.execute(wait.bind(null, 3, 2000));
pool.execute(wait.bind(null, 4, 1500));
pool.done().then(res => console.log(res)); */
