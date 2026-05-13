# CORS 代理伺服器設定指南

使用 Cloudflare Workers 建立伺服器端中繼站，繞過瀏覽器的 CORS 跨網域限制。

## 為什麼我需要這個？
瀏覽器基於安全性考量，會阻止網頁程式存取不同網域的 API，除非該伺服器明確允許（CORS 政策）。代理伺服器扮演中間人的角色，幫您抓取資料並補上正確的允許標頭。

## 快速開始 (Cloudflare Workers)

1. **建立 Worker**: 登入 [Cloudflare](https://dash.cloudflare.com/) 並建立一個新的 "Worker"。
2. **部署程式碼**: 將以下邏輯貼入 Worker 編輯器中：

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) return new Response('缺少 url 參數', { status: 400 });

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

3. **套用設定**: 複製您的 Worker 網址（例如：`https://my-proxy.workers.dev`）並將其貼回本系統的「**系統設定**」頁面。
