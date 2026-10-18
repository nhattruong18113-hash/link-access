// Gọi Upstash Redis qua REST, không cần cài thư viện.
// Vercel Marketplace (Upstash) tự thêm biến môi trường KV_REST_API_* hoặc UPSTASH_REDIS_REST_*.
async function redis(...args) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("redis_not_configured");

  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || `redis_http_${r.status}`);
  return j.result;
}

module.exports = { redis };
