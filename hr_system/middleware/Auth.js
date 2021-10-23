const secret = require("../config");
const jwt = require("jsonwebtoken");

exports.Auth = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      message: "Auth token missing in header",
    });
  }
  let token = req.headers.authorization.split(" ");
  try {
    const checkJwt = await jwt.verify(token[1], secret.jwtSecret);
    req.userData = checkJwt;
    // console.log(req.userData.user_id)
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Auth token invalid",
    });
  }
};
