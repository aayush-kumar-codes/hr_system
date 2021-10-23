const db = require("../db");
const providers = require("../providers/creation-provider");
const reqUser = require("../providers/error-check");
const jwt = require("jsonwebtoken");
const secret = require("../config");

exports.getLifeCycleController = async (req, res, next) => {
  try {
    let employeeLifeCycle = await db.LifeCycle.getLifeCycle(req.body);
    res.status_code = 200;
    res.data = employeeLifeCycle;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.updateLifeCycleController = async (req, res, next) => {
  try {
    let lifeCycleData = await db.LifeCycle.updateLife(req.body, db);
    res.status_code = 200;
    res.message = lifeCycleData;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.addTeamController = async(req, res, next) => {
    try {
        let team = await db.Config.addTeam(req.body)
    } catch (error) {
        res.status_code = 500;
        res.message = error.message;
        return next();
    }
}