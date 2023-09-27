import htmlrewriter from './rewrite/html';
import { url } from './rewrite/url';

interface Context {
    url: url;
    html: htmlrewriter;
    fetch: (request: Request, server: Server) => Promise<Response>;
}