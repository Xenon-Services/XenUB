import proxy from './src/proxy';

Bun.serve({
  port: 80,
  async fetch(request, server) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/service/")) {
      return await proxy.fetch(request, server);
    }

    const file = await Bun.file("./static" + new URL(request.url).pathname.replace(/^\/$/, "/index.html"));

    return new Response(
      file
    );
  }
})