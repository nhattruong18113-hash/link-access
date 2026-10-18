// BOT DISCORD gọi: đổi mã -> userId Roblox (dùng 1 lần, lấy xong là xoá)
// POST /api/claim  header X-Secret  body {"code": "tsqct-aK7mP2x", "discordId": "123"}
const { redis } = require("./_redis");
const { CODE_RE, TTL_SECONDS, send, checkSecret, readJson } = require("./_util");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { ok: false, error: "method_not_allowed" });
  if (!checkSecret(req)) return send(res, 401, { ok: false, error: "unauthorized" });

  const body = readJson(req);
  const code = String(body.code || "");
  if (!CODE_RE.test(code)) return send(res, 404, { ok: false, error: "invalid_or_expired" });

  try {
    const raw = await redis("GETDEL", `link:${code}`); // lấy + xoá cùng lúc, không ai dùng lại được
    if (!raw) return send(res, 404, { ok: false, error: "invalid_or_expired" });

    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    await redis("SET", `done:${code}`, String(body.discordId || "1"), "EX", TTL_SECONDS);
    return send(res, 200, { ok: true, userId: data.userId });
  } catch (e) {
    return send(res, 500, { ok: false, error: "server_error" });
  }
};
