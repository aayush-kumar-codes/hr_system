const secret = require("../config");
const jwt = require("jsonwebtoken");
const db = require("../db");

exports.AuthForAdmin = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      message: "Auth token missing in header",
    });
  }
  let token = req.headers.authorization.split(" ");
  try {
    const checkJwt = await jwt.verify(token[1], secret.jwtSecret);
    const user = await db.User.findOne({ where: { id: checkJwt.data.id } });
    if (user.type == "admin") {
      req.userData = checkJwt.data;
      next();
    } else {
      res.send("you are not authorized");
    }
  } catch (error) {
    return res.status(401).json({
      message: "Auth token invalid",
    });
  }
};

exports.AuthForUser = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      message: "Auth token missing in header",
    });
  }
  let token = req.headers.authorization.split(" ");
  try {
    const checkJwt = await jwt.verify(token[1], secret.jwtSecret);
    const user = await db.User.findOne({ where: { id: checkJwt.user_id } });
    req.userData = checkJwt;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Auth token invalid",
    });
  }
};

exports.Auth = async (req, res, next) => {};

exports.AuthForHr = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      message: "Auth token missing in header",
    });
  }
  let token = req.headers.authorization.split(" ");
  try {
    const checkJwt = await jwt.verify(token[1], secret.jwtSecret);
    const user = await db.User.findOne({ where: { id: checkJwt.data.id } });
    if (user.type == "hr") {
      req.userData = checkJwt;
      next();
    } else {
      res.send("you are not authorized");
    }
  } catch (error) {
    return res.status(401).json({
      message: "Auth token invalid",
    });
  }
};

