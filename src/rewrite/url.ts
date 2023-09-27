export default {
    encode: (url: string, meta: URL): string => {
        return `/service/${encodeURIComponent(new URL(url, meta).href)}`;
    },
    decode: (url: string, meta: URL): URL => {
        return new URL(decodeURIComponent(url.substring("/service/".length)), meta);
    }
}