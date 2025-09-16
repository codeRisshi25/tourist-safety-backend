// JWT authentication middleware for Express

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Use env var in production

export default function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.tourist = decoded; // Attach decoded payload (should contain tourist id)
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
