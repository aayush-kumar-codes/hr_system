const db = require("../db");
const providers = require("../providers/creation-provider");
const reqValidate = require("../providers/error-check");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const secret = require("../config");
const {
  API_getUserTimeSheet,
  API_userTimeSheetEntry,
  API_submitUserTimeSheet,
} = require("../attendaceFunctions");

exports.month_attendance = async (req, res, next) => {
  let userid = req.body["userid"];
  let year = req.body["year"];
  let month = req.body["month"];
  let response = await getUserMonthAttendaceComplete(userid, year, month, db);
};

exports.get_user_timesheet = async (req, res, next) => {
  try {
    let userid = false;
    let d = new Date();
    let date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    let from_date = date;
    if (!_.isEmpty(req.body.user_id)) {
      userid = req.body.user_id;
      from_date = _.isSet(req.body.from_date) ? req.body.from_date : from_date;
      let result = await API_getUserTimeSheet(userid, from_date, db);
      res.status_code = 200;
      res.error = result.error;
      res.data = result.data;
    } else {
      res.status_code = 401;
      res.message = "Please enter user id";
    }
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.user_timesheet_entry = async (req, res, next) => {
  try {
    let result = await API_userTimeSheetEntry(req.body, db);
    res.status_code = 200;
    res.error = result.error;
    res.message = result.message;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

let getMonday = async (d) => {
  d = new Date(d);
  let day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

exports.submit_timesheet = async (req, res, next) => {
  try {
    let userid = false;
    let d = await getMonday(new Date());
    let monday = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    monday = _.isSet(req.body.from_date) ? req.body.from_date : monday;
    if (!_.isEmpty(req.body.user_id)) {
      userid = req.body.user_id;
      let result = await API_submitUserTimeSheet(userid, monday, db);
      res.status_code = 200;
      res.error = result.error;
      res.message = result.message;
    } else {
      res.status_code = 403;
      res.error = 1;
      res.message = "please give user id";
    }
    return next();
  } catch (error) {
    console.log(error);
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};
