import { Context } from "../types";

export default class htmlrewriter {
    constructor(public ctx: Context) {}

    async rewrite(body: string, meta: URL): Promise<string> {
        const rewriter = new HTMLRewriter();

        rewriter.on("*", {
            element: (element) => {
                if (element.tagName == "head") {
                    element.prepend(`<script src="${"/service/client.js"}"></script>`, { html: true });
                }

                if (element.tagName === "base") {
                    element.setAttribute("href", this.ctx.url.encode(element.getAttribute("href") || "", meta));
                }

                if (element.tagName === "meta") {
                    if (element.getAttribute("http-equiv")! === "refresh") {
                        const content = element.getAttribute("content")!;
                        const [time, url] = content.split(";").map((str) => str.trim());

                        element.setAttribute("content", `${time}; url=${this.ctx.url.encode(url, meta)}`);
                    }
                }

                for (const attr of element.attributes) {
                    if (element.tagName === "meta") continue;

                    if (attr[0] === "href" || attr[0] === "src" || attr[0] === "action") {
                        if (element.tagName === "base") continue;

                        element.setAttribute(attr[0], this.ctx.url.encode(attr[1], meta));
                    }

                    if (attr[0] === "srcset" || attr[0] === "imagesrcset") {
                        const srcset = attr[1].split(",").map((src) => {
                            const [url, size] = src.trim().split(" ");
                            return `${this.ctx.url.encode(url, meta)} ${size}`;
                        }).join(", ");

                        element.setAttribute(attr[0], srcset);
                    }
                }
            }
        });

        const res = rewriter.transform(new Response(body, {}));

        return await res.text() || "";
    }
}