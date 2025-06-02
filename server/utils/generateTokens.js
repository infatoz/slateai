const jwt = require("jsonwebtoken");

exports.generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "30d",
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};
