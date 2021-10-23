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
exports.getDisabledUser = async(req,res,next) =>{
    try{
        let disabledUsers = await db.User.getDisabledUsers();
        res.data = disabledUsers;
        res.status_code = 200;
        return next();
    }catch(error){
        res.status_code = 500;
        res.message = error.message;
        return next();
    }

}
// exports.getUserDocumentById = async (req,res,next) =>{
//     try{
//         // let UserDocumentById= await 

//     }catch(error){
//         res.status_code = 500;
//         res.message = error.message;
//         return next(    
//     }
// }
