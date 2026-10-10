import jwt from "jsonwebtoken";

// Runs before every notes route. It finds out who is making the request from
// the login cookie and stops the request if nobody is logged in.
export function requireAuth(req, res, next) {
  const token = req.cookies.token;
  try {
    // verify() checks the signature and the expiry date, so a forged or
    // old token is rejected.
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch {
    res.status(401).json({ error: "Please log in" });
  }
}
