var global: any = globalThis;

global._wrap = function wrap(obj: any, prop: string) {
    const fn: Function | undefined = obj[prop];

    if (typeof fn !== "function") return fn;

    const wrapped = function(this: any, ...args: any[]) {
        return fn.apply(this, args);
    }

    Object.setPrototypeOf(wrapped, fn);

    return wrapped;
}