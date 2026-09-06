const { createClient } = require("@supabase/supabase-js");
const { getCookie, verifyToken, json } = require("./_shared/auth");

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode() {
  let code = "";
  for (let i = 0; i < 5; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return code;
}

function db() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  if (!(await verifyToken(getCookie(event, "akkoflac_admin"), "admin"))) {
    return json(401, { error: "Unauthorized" });
  }

  try {
    const supabase = db();
    let code;
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = makeCode();
      const { data, error } = await supabase
        .from("access_codes")
        .insert({ code: candidate, used: false })
        .select("id, code, created_at")
        .single();
      if (!error) { code = data; break; }
      if (error.code !== "23505") throw error;
    }

    if (!code) return json(500, { error: "Could not generate a unique code." });
    return json(200, { code }, { "Cache-Control": "no-store" });
  } catch (error) {
    console.error(error);
    return json(500, { error: "Server error." });
  }
};
