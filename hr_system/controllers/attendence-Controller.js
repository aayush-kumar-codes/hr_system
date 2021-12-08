const db = require("../db");
const providers = require("../providers/creation-provider");
const reqValidate = require("../providers/error-check");
const jwt = require("jsonwebtoken");
const secret = require("../config");
const {_}=require("lodash")
const{getUserMonthAttendaceComplete}=require("../leavesFunctions")
const {getAllUserPrevMonthTime,updateDayWorkingHours,
  multipleAddUserWorkingHours,getWorkingHoursSummary,
  addUserWorkingHours,geManagedUserWorkingHours,
  getEmployeeCurrentMonthFirstWorkingDate,
  insertUserInOutTimeOfDay }=require("../attendaceFunctions");
exports.month_attendance = async (req, res, next) => {
  try{
  let userid = req.body["userid"];
  let year = req.body["year"];
  let month = req.body["month"];
  let response = await getUserMonthAttendaceComplete(userid, year, month, db);
  res.status_code=200;
  res.data=response;
  return next();
  }catch(error){
    console.log(error)
    res.status_code=500;
    res.message=error;
    return next();
  }
};
exports.get_all_user_previous_month_time = async (req, res, next) => {
  try{
    let year =req.body['year'];
    let month =req.body['month'];
    let resp =await getAllUserPrevMonthTime(year,month,db);  
    res.status_code=200;
    res.data=resp.data;
    res.error=resp.error;
    res.message=resp.message;
    return next();
  }catch(error){
    console.log(error);
    res.status_code=500;
    res.message=error;
    return next();
  }
};

exports.update_day_working_hours = async (req, res, next) => {
  try{
   let date = req.body['date'];
   let time = req.body['time'];
   let resp = await updateDayWorkingHours(date,time,db);
   console.log(112)
    res.status_code=200;
    res.data=resp.data;
    res.error=resp.error;
    res.message=resp.message;
    return next();
  }catch(error){
    console.log(error);
    res.status_code=500;
    res.message=error;
    return next();
  }
};

exports.multiple_add_user_working_hours = async (req, res, next) => {
  try{
    let resp = await multipleAddUserWorkingHours(req,db);
    console.log(resp)
    res.status_code=200;
    res.data=resp.data;
    res.error=resp.error;
    res.message=resp.message;
    return next();
  }catch(error){
    console.log(error);
    res.status_code=500;
    res.message=error;
    return next();
  }
};
exports.working_hours_summary = async (req, res, next) => {
  try{
    let year = req.body['year'];
    let month = req.body['month'];
    let resp =await getWorkingHoursSummary(year, month,db);
    res.status_code=200;
    res.data=resp.data;
    res.error=resp.error;
    res.message=resp.message;
    return next();
  }catch(error){
    console.log(error);
    res.status_code=500;
    res.message=error;
    return next();
  }
};
exports.add_user_working_hours = async (req, res, next) => {
  try{
    let resp;
    let userid = req.body['userid'];
    let date = req.body['date'];
    let working_hours = req.body['working_hours'];
    let reason = req.body['reason'];
     if (_.isSet(req.body['pending_id'])) {
      let userNextWorkingDate = await getEmployeeCurrentMonthFirstWorkingDate(userid,db);
      date = userNextWorkingDate['full_date'];
      reason = 'Previous month pending time merged!!';
      resp = await addUserWorkingHours(userid, date, working_hours, reason,db,req.body['pending_id']);
  } else {
      resp =await addUserWorkingHours(userid, date, working_hours, reason,db);
  } 
    res.status_code=200;
    res.data=resp.data;
    res.error=resp.error;
    res.message=resp.message;
    return next();
  }catch(error){
    console.log(error);
    res.status_code=500;
    res.message=error;
    return next();
  }
};
exports.get_managed_user_working_hours = async (req, res, next) => {
  try{
   let userid =req.body['userid'];
   let resp = await geManagedUserWorkingHours(userid,db);
    res.status_code=200;
    res.data=resp.data;
    res.error=resp.error;
    res.message=resp.message;
    return next();
  }catch(error){
    console.log(error);
    res.status_code=500;
    res.message=error;
    return next();
  }
};

exports.update_user_day_summary = async (req, res, next) => {
  try{
   let userid =req.body['userid'];
   let date =req.body['date'];
   let entry_time =req.body['entry_time'];
   let exit_time =req.body['exit_time'];
   let reason =req.body['reason'];
   let resp = await insertUserInOutTimeOfDay(userid, date, entry_time, exit_time,reason,db);
    console.log(` address complete`)
    res.status_code=200;
    res.data=resp.data;
    res.error=resp.error;
    res.message=resp.message;
    return next();
  }catch(error){
    console.log(error);
    res.status_code=500;
    res.message=error;
    return next();
  }
};
