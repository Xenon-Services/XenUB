import { gunzipSync, inflateRawSync } from "zlib";
import decompress from "brotli/decompress";

export default {
    async decompress(body: Buffer, headers: Headers): Promise<Buffer | string | ArrayBuffer | Uint8Array> {
        let out: Uint8Array;

        try {
            switch(headers.get('content-encoding')) {
                case 'br':
                    out = decompress(body);
                    break;
                case 'gzip':
                    out = gunzipSync(body);
                    break;
                case 'deflate':
                    out = inflateRawSync(body);
                    break;
                default:
                    out = body;
            }
        } catch(err) {
            out = body;
        }

        headers.delete('content-encoding');

        return out;
    }
};