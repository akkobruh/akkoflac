const { getCookie, verifyToken, json } = require("./_shared/auth");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  const valid = await verifyToken(getCookie(event, "akkoflac_access"), "access");
  return json(200, { unlocked: valid }, { "Cache-Control": "no-store" });
};
