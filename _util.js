const crypto = require("crypto");

const CODE_RE = /^tsqct-[A-Za-z0-9]{7}$/;
const TTL_SECONDS = 600; // mã sống 10 phút

function send(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  res.status(status).json(body);
}

// So sánh secret an toàn (chống dò thời gian)
function checkSecret(req) {
  const expected = process.env.SECRET || "";
  if (!expected) return false;
  const got = String(req.headers["x-secret"] || "");
  const a = crypto.createHash("sha256").update(got).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

function readJson(req) {
  const b = req.body;
  if (b && typeof b === "object") return b;
  try {
    return JSON.parse(b || "{}");
  } catch {
    return {};
  }
}

module.exports = { CODE_RE, TTL_SECONDS, send, checkSecret, readJson };
