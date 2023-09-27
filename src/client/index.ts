var global: any = globalThis;

global._wrap = function wrap(obj: any, prop: string) {
    const fn: Function | undefined = obj[prop];

    if (typeof fn !== "function") return fn;

    const wrapped = fn.prototype ? function (this: any, ...args: any[]) {
        return fn.apply(this, args);
    } : {
        func: (...args: any[]) => {
            return fn.apply(obj, args);
        }
    }.func;

    return wrapped;
}