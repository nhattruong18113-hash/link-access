// GAME gọi: mã đã được dùng trong Discord chưa?
// GET /api/status?code=tsqct-aK7mP2x   header X-Secret
// -> {claimed:true} | {claimed:false, pending:true} | {claimed:false, pending:false} (hết hạn)
const { redis } = require("./_redis");
const { CODE_RE, send, checkSecret } = require("./_util");

module.exports = async (req, res) => {
  if (req.method !== "GET") return send(res, 405, { ok: false, error: "method_not_allowed" });
  if (!checkSecret(req)) return send(res, 401, { ok: false, error: "unauthorized" });

  const code = String((req.query && req.query.code) || "");
  if (!CODE_RE.test(code)) return send(res, 400, { ok: false, error: "bad_request" });

  try {
    const done = await redis("GET", `done:${code}`);
    if (done) return send(res, 200, { ok: true, claimed: true });
    const exists = await redis("EXISTS", `link:${code}`);
    return send(res, 200, { ok: true, claimed: false, pending: Number(exists) === 1 });
  } catch (e) {
    return send(res, 500, { ok: false, error: "server_error" });
  }
};
