import url from "./rewrite/url";
import { Context } from "./types";
import deflate from "./deflate";
import htmlrewriter from "./rewrite/html";

function rewriteHeaders(headers: Headers, url: URL): Headers {
    const newHeaders = new Headers(headers);
    newHeaders.set("host", url.host);
    newHeaders.set("origin", url.origin);
    newHeaders.set("referer", url.href);

    return newHeaders;
}

function rewriteResponse(headers: Headers, meta: URL, ctx: Context): Headers {
    const newHeaders = new Headers(headers);

    [
        "access-control-allow-origin",
        "access-control-allow-credentials",
        "access-control-allow-headers",
        "access-control-allow-methods",
        "access-control-expose-headers",
        "access-control-max-age",
        "access-control-request-headers",
        "access-control-request-method",
        "x-frame-options",
        "x-xss-protection",
        "x-content-type-options",
        "x-ua-compatible",
        "x-forwarded-for",
        "x-forwarded-host",
        "x-forwarded-proto",
        "content-security-policy",
        "content-security-policy-report-only",
        "clear-site-data",
        "public-key-pins",
    ].forEach((header) => {
        if (newHeaders.get(header)) newHeaders.delete(header);
    });

    if (newHeaders.get("location")) {
        const location = newHeaders.get("location");

        if (location) newHeaders.set("location", ctx.url.encode(location, meta));
    }

    return newHeaders;
}

function getURLMeta(path: string): URL {
    return new URL(decodeURIComponent(path.substring("/service/".length)));
}

export default new class extends EventTarget {
    constructor() {
        super();
    }
    get build() {
        return Bun.build(
            {
            entrypoints:[
                'src/client/index.ts'
            ],
            outdir: 'dist',
            minify: true,
            sourcemap: "inline",
            }
        );
    }
    url: Context["url"] = url;
    html: htmlrewriter = new htmlrewriter(this);
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        if (!url.pathname.startsWith("/service/")) {
            return new Response("404", {
                status: 404,
            });
        }

        if (url.pathname === "/service/client.js") {
            const path = (await this.build).outputs[0].path;
            
            return new Response(Bun.file(path), {
                headers: {
                    "content-type": "text/javascript"
                }
            });
        }

        const meta = await getURLMeta(url.pathname + url.search + url.hash);

        const response = await fetch(meta.href, {
            headers: rewriteHeaders(request.headers, meta),
            method: request.method,
            redirect: "manual"
        });
        
        const type = response.headers.get("content-type")?.split(";")[0];
        let body: ArrayBuffer | string | Blob | Buffer = new Blob(
            [
                await deflate.decompress(
                    Buffer.from(await response.arrayBuffer()),
                    response.headers
                )
            ],
            { type }
        );

        switch(type) {
            case "text/html":
                body = new Blob([ await this.html.rewrite(await body.text(), meta) ], { type });
        }

        return new Response(body, {
            headers: rewriteResponse(response.headers, meta, this),
            status: response.status,
            statusText: response.statusText,
        });
    }
} as Context;