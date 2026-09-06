const { createClient } = require("@supabase/supabase-js");
const { getCookie, verifyToken, json } = require("./_shared/auth");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  if (!(await verifyToken(getCookie(event, "akkoflac_admin"), "admin"))) return json(401, { error: "Unauthorized" });

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("access_codes")
      .select("id, code, created_at")
      .eq("used", false)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return json(200, { codes: data || [] }, { "Cache-Control": "no-store" });
  } catch (error) {
    console.error(error);
    return json(500, { error: "Server error." });
  }
};
