// GAME gọi: lưu mã -> userId Roblox
// POST /api/link   header X-Secret   body {"userId": 123, "code": "tsqct-aK7mP2x"}
const { redis } = require("./_redis");
const { CODE_RE, TTL_SECONDS, send, checkSecret, readJson } = require("./_util");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { ok: false, error: "method_not_allowed" });
  if (!checkSecret(req)) return send(res, 401, { ok: false, error: "unauthorized" });

  const body = readJson(req);
  const code = String(body.code || "");
  const userId = Number(body.userId);
  if (!CODE_RE.test(code) || !Number.isSafeInteger(userId) || userId <= 0) {
    return send(res, 400, { ok: false, error: "bad_request" });
  }

  try {
    const r = await redis("SET", `link:${code}`, JSON.stringify({ userId, ts: Date.now() }), "EX", TTL_SECONDS, "NX");
    if (r !== "OK") return send(res, 409, { ok: false, error: "code_exists" });
    return send(res, 200, { ok: true, expiresIn: TTL_SECONDS });
  } catch (e) {
    return send(res, 500, { ok: false, error: "server_error" });
  }
};
