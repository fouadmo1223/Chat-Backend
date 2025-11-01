const jwt = require("jsonwebtoken");

const generateToken = (id, name, email) => {
  const payload = { id, name, email };

  // Sign token
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token valid for 7 days
  });
};

module.exports = generateToken;
