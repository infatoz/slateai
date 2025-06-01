const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  // Check for token in cookies or Authorization header
  const token =
    req.cookies?.accessToken ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1]);
      
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Token expired or invalid" });
  }
};
