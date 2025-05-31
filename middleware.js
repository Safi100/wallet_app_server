const jwt = require("jsonwebtoken");
const HandleError = require("./utils/HandleError");

module.exports.isLoggedIn = (req, res, next) => {
  try {
    const token = req.headers.authorization || req.cookies.access_token;
    if (!token) throw new HandleError("You must log in to access this", 401);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) throw new HandleError("Invalid token", 401);
      req.user = decoded;
      next();
    });
  } catch (e) {
    next(e);
  }
};
