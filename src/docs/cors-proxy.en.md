# CORS Proxy Setup Guide

Bypass browser CORS restrictions using a server-side relay with Cloudflare Workers.

## Why do I need this?
Browsers prevent web apps from fetching data from different domains unless the server explicitly allows it (CORS). A Proxy acts as a middleman that fetches the data for you and adds the necessary headers.

## Quick Start (Cloudflare Workers)

1. **Create Worker**: Login to [Cloudflare](https://dash.cloudflare.com/) and create a new "Worker".
2. **Deploy Code**: Paste the following logic into the Worker editor:

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) return new Response('Missing url', { status: 400 });

    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
    });

    let response = await fetch(newRequest);
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', '*');

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  },
};
```

3. **Usage**: Copy your Worker URL (e.g., `https://my-proxy.workers.dev`) and paste it into the **Settings** page.
