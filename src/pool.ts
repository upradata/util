type AsyncFunc = () => Promise<any>;

export class Pool {
    public size: number;
    private result = new Map<number, AsyncFunc>();
    private pool = new Map<AsyncFunc, any /* return value */>();
    private queue: AsyncFunc[] = [];
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

    public execute(asyncFunc: AsyncFunc) {
        this.queue.push(asyncFunc);
        this.next();
    }

    private next() {
        if (this.pool.size < this.size && this.queue.length > 0) {
            const asyncFunc = this.queue.pop();

            ++this.i;
            const i = this.i;

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

    public done() {
        this.isDoneCalled = true;

        return new Promise((res, rej) => {
            this.resolve = () => {
                const resultArrayInOrder = [];
                for (const [ i, v ] of this.result)
                    resultArrayInOrder[ i ] = v;

                res(resultArrayInOrder);
            };
        });
    }
}

/* const pool = new Pool();

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
