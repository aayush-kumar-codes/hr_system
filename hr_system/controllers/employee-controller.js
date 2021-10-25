const db = require("../db");
const providers = require("../providers/creation-provider");
const reqUser = require("../providers/error-check");
const jwt = require("jsonwebtoken");
const secret = require("../config");

exports.getUserProfileController = async (req, res, next) => {
  try {
    let userProfileDetails = await db.UserProfile.getUserProfile();
    res.data = userProfileDetails;
    res.status_code = 200;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

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

exports.getUserProfileByIdConttroller = async (req, res, next) => {
  try {
    let userProfileDetailsById = await db.UserProfile.getUserProfileDetailsById(
      req.body
    );
    res.data = userProfileDetailsById;
    res.status_code = 200;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.getEnabledUser = async (req, res, next) => {
  try {
    let enabledUsers = await db.User.getEnabledUsers();
    res.data = enabledUsers;
    res.status_code = 200;
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
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.getDisabledUser = async (req, res, next) => {
  try {
    let disabledUsers = await db.User.getDisabledUsers();
    res.data = disabledUsers;
    res.status_code = 200;
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

exports.getUserPolicyDocument= async (req,res,next)=>{
  try{
      let userPolicyDocument=await db.UserProfile.getUserPolicyDocument(req);
      res.data=userPolicyDocument.policy_document;
      res.status_code=200;
      return next();
  } catch (error) {
      res.status_code = 500;
      res.message = error.message;
      return next();
    }
}

exports.updateUserPolicyDocument = async(req,res,next)=>{
  try{
     let updatedUserPolicyDocument=await db.UserProfile.updateUserPolicyDocument(req);
      res.message="updated"
      res.status_code=200;
      return next();
  }catch(error){
      res.status_code = 500;
      res.message = error.message;
      return next();
  }
}

exports.uploadUserDocument=async(req,res,next)=>{
  try{
      let uploadUserDocument=await db.Document.uploadUserDocument(req);
      res.message=uploadUserDocument,
      res.status_code=200;
      return next();
  }catch(error){
      res.status_code = 500;
      res.message = error.message;
      return next();
  }

}

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
  }catch(error){
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
exports.getUserDocument = async (req, res, next) => {
  try {
    let userDocument = await db.Document.getUserDocument();
     res.data =userDocument;
     res.status_code=200;
     return next();
  } catch(error){
    res.status_code =500;
    res.message =error.message;
    return next();
  }
};