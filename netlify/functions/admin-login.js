const { makeToken, cookie, json } = require("./_shared/auth");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const { password } = JSON.parse(event.body || "{}");
    const supplied = String(password || "");
    const expected = String(process.env.ADMIN_PASSWORD || "");

    if (!expected || supplied !== expected) return json(401, { ok: false, error: "Incorrect password." });

    const token = await makeToken("admin");
    return json(200, { ok: true }, {
      "Set-Cookie": cookie("akkoflac_admin", token, 60 * 60 * 12),
      "Cache-Control": "no-store"
    });
  } catch (error) {
    return json(400, { ok: false, error: "Invalid request." });
  }
};
