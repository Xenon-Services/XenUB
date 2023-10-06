import './http.ts';

declare global {
    interface Window {
        _wrap: (obj: WrapperObject, prop: string) => unknown;
    }
}

interface WrapperObject {
    [key: string]: (...args: unknown[]) => unknown;
}

window._wrap = function wrap(obj: WrapperObject, prop: string) {
    const fn: (...args: unknown[]) => unknown | undefined = obj[prop];

    if (typeof fn !== "function") return fn;

    const wrapped = fn.prototype ? function (this: any, ...args: any[]) {
        return fn.apply(this, args);
    } : {
        func: (...args: any[]) => {
            return fn.apply(obj, args);
        }
    }.func;

    if (fn.prototype) wrapped.prototype = fn.prototype;

    return wrapped;
};