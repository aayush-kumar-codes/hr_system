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

exports.addTeamController = async (req, res, next) => {
  try {
    let team = await db.Config.addTeam(req.body);
    if (team) {
      res.status_code = 200;
      res.message = "created";
    } else {
      res.status_code = 401;
      res.message = "not created";
    }
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.getTeamListController = async (req, res, next) => {
  try {
    let foundTeamList = await db.Config.findTeam();
    if (foundTeamList) {
      res.status_code = 200;
      res.data = foundTeamList;
    } else {
      res.status_code = 401;
      res.message = "not found";
    }
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.updateBankDetailsController = async (req, res, next) => {
  try {
    let updatedDetails = await db.BankDetails.updateBankDetails(req.body);
    res.status_code = 200;
    res.message = updatedDetails;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.deleteRoleController = async (req, res, next) => {
  try {
    let deletedRole = await db.Role.deleteRole(req.body);
    res.status_code = 200;
    res.message = deletedRole;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.changeStatusController = async (req, res, next) => {
  try {
    let changedStatus = await db.User.changeStatus(req.body);
    res.status_code = 200;
    res.message = changedStatus;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.updateUserBYIdController = async (req, res, next) => {
  try {
    let updatedUser = await db.UserProfile.updateUserById(req.body);
    res.status_code = 200;
    res.message = updatedUser;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.updateNewPassController = async (req, res, next) => {
  try {
    let userData = req.userData;
    let updatedPassword = await db.User.updatePassword(req.body, userData);
    res.status_code = 200;
    res.message = updatedPassword;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.updateEmployeePassControllers = async (req, res, next) => {
  try {
    let updatedEmployeePass = await db.User.empUpdatePass(req.body);
    res.status_code = 200;
    res.message = updatedEmployeePass;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};
