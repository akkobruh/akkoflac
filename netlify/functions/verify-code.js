const { createClient } = require("@supabase/supabase-js");
const { makeToken, cookie, json } = require("./_shared/auth");

function db() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = JSON.parse(event.body || "{}");
    const code = String(body.code || "").trim().toUpperCase();
    if (!/^[A-Z0-9]{5}$/.test(code)) return json(400, { valid: false, error: "Enter a valid 5-character code." });

    const supabase = db();
    const { data, error } = await supabase
      .from("access_codes")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("code", code)
      .eq("used", false)
      .select("id, code")
      .maybeSingle();

    if (error) {
      console.error(error);
      return json(500, { valid: false, error: "Server error. Try again." });
    }

    if (!data) return json(401, { valid: false, error: "That code is invalid or has already been used." });

    const token = await makeToken("access");
    return json(200, { valid: true }, {
      "Set-Cookie": cookie("akkoflac_access", token, 60 * 60 * 24 * 365 * 10),
      "Cache-Control": "no-store"
    });
  } catch (error) {
    console.error(error);
    return json(400, { valid: false, error: "Invalid request." });
  }
};
