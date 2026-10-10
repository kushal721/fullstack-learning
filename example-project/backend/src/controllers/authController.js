import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const PASSWORD_MIN_LENGTH = 8;
const BCRYPT_COST = 12;
const SESSION_DAYS = 7;
const UNIQUE_VIOLATION = "23505";

const cookieOptions = {
  // JavaScript in the page cannot read the cookie, so an XSS bug can't
  // steal it.
  httpOnly: true,
  // Other websites can't make the browser send it with their requests.
  sameSite: "lax",
  // Only sent over HTTPS in production (local development uses http).
  secure: process.env.NODE_ENV === "production",
  maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
};

function readCredentials(body) {
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  return { email, password };
}

export async function register(req, res) {
  const { email, password } = readCredentials(req.body);
  if (!email.includes("@")) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address" });
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    });
  }

  // Never store the password itself: bcrypt makes a slow, salted hash.
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  try {
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // The UNIQUE rule on email is the real check, so two sign-ups at the
    // same moment can't both succeed.
    if (err.code === UNIQUE_VIOLATION) {
      return res.status(409).json({ error: "Email already registered" });
    }
    throw err;
  }
}

export async function login(req, res) {
  const { email, password } = readCredentials(req.body);
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const result = await pool.query(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [email],
  );
  const user = result.rows[0];
  const passwordMatches =
    user && (await bcrypt.compare(password, user.password_hash));

  // The same message for "no such user" and "wrong password", so nobody can
  // find out which emails are registered.
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: `${SESSION_DAYS}d`,
  });
  res.cookie("token", token, cookieOptions);
  res.json({ id: user.id, email: user.email });
}

export function logout(req, res) {
  res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
  res.status(204).end();
}

export async function currentUser(req, res) {
  const result = await pool.query("SELECT id, email FROM users WHERE id = $1", [
    req.user.id,
  ]);
  if (result.rowCount === 0) {
    return res.status(401).json({ error: "Please log in" });
  }
  res.json(result.rows[0]);
}
