const jwt = require("jsonwebtoken");
const secret = require("./config.json");
const { Op, QueryTypes, json } = require("sequelize");
const db = require("./db");
const { sequelize } = require("./db");
const { MachineStatusDeleteValidator } = require("./validators/req-validators");
const user = require("./models/userModel");
const { Query } = require("pg");
const { object } = require("webidl-conversions");

let _getPreviousMonth = async (currentDate) => {
  var makeDate = new Date(currentDate);
  let prev = new Date(
    makeDate.getFullYear(),
    makeDate.getMonth() ,
    makeDate.getMonth()
  );
  let previousMonth = {};
  previousMonth.year = prev.getFullYear();
  previousMonth.month = prev.getMonth();
  console.log(previousMonth)
  return previousMonth;
};

let getEmployeeLastPresentDay = async (userid, year, month, db) => {
  let Return = false;
  let monthDetails = await getUserMonthAttendace(userid, year, month, db);
  monthDetails = array_reverse(monthDetails);
  // foreach( monthDetails as md ){
  //     if( md['day_type'] == 'WORKING_DAY' && ( md['in_time'] || md['out_time'] )  ){
  //         Return = md;
  //         break;
  //     }
  // }
  return Return;
};
let getUserMonthAttendace = async (userid, year, month, db) => {
  let genericMonthDays = await getGenericMonthSummary(year, month, userid, db); // $userid added on 5jan2018 by arun so as to use user working hours
  console.log(genericMonthDays);
  let userMonthPunching = await getUserMonthPunching(userid, year, month, db);
  let userMonthLeaves = await getUserMonthLeaves(userid, year, month, db);

  if (userMonthLeaves.length > 0) {
    let raw_userMonthLeaves = userMonthLeaves;
    userMonthLeaves = [];
    for (let [k, v] of Object.entries(raw_userMonthLeaves)) {
      v_status = v["status"];
      if (
        v_status.toLowerCase() == "pending" ||
        v_status.toLowerCase() == "approved"
      ) {
        userMonthLeaves[k] = v;
      }
    }
  }

  let Return = [];
  for (let [k, v] of genericMonthDays) {
    if (userMonthPunching.includes(k)) {
      v["in_time"] = userMonthPunching[k]["in_time"];
      v["out_time"] = userMonthPunching[k]["out_time"];
      v["total_time"] = userMonthPunching[k]["total_time"];
      v["extra_time_status"] = userMonthPunching[k]["extra_time_status"];
      v["extra_time"] = userMonthPunching[k]["extra_time"];
      v["orignal_total_time"] = userMonthPunching[k]["orignal_total_time"];

      v["seconds_actual_working_time"] =
        userMonthPunching[k]["seconds_actual_working_time"];
      v["seconds_actual_worked_time"] =
        userMonthPunching[k]["seconds_actual_worked_time"];
      v["seconds_extra_time"] = userMonthPunching[k]["seconds_extra_time"];
      v["office_time_inside"] = userMonthPunching[k]["office_time_inside"];

      Return[k] = v;
    } else {
      Return[k] = v;
    }
  }

  for (let [k, v] of Object.entries(Return)) {
    if (userMonthLeaves.includes(key)) {
      leave_number_of_days = userMonthLeaves[k]["no_of_days"];
      if (leave_number_of_days < 1) {
        // this means less then 1 day leave like half day
        v["day_type"] = "HALF_DAY";
        v["day_text"] = userMonthLeaves[k]["reason"];
        v["office_working_hours"] = "04:30";
        v["orignal_total_time"] = v["orignal_total_time"] / 2;
        v["leave_type"] = userMonthLeaves[k]["leave_type"].toLowerCase();
        v["leave_status"] = userMonthLeaves[k]["status"].toLowerCase();
      } else {
        v["day_type"] = "LEAVE_DAY";
        if (
          userMonthLeaves[k]["leave_type"].toLowerCase() == "restricted" ||
          userMonthLeaves[k]["leave_type"].toLowerCase() == "rh compensation"
        ) {
          v["day_type"] = "RH";
        }
        v["day_text"] = userMonthLeaves[k]["reason"];
        v["leave_type"] = userMonthLeaves[k]["leave_type"].toLowerCase();
        v["leave_status"] = userMonthLeaves[k]["status"].toLowerCase();
      }
      Return[k] = v;
    } else {
      Return[k] = v;
    }
  }
  for (let [k, r] of Object.entries(Return)) {
    if (r["day_type"] == "WORKING_DAY") {
      if (r["in_time"] == "" || r["out_time"] == "") {
        r["admin_alert"] = 1;
        r["admin_alert_message"] = "In/Out Time Missing";
      }
      Return[k] = r;
    }
  }
  let finalReturn = [];
  for (let r of Object.entries(Return)) {
    finalReturn.push(r);
  }
  console.log(4432546574);
  return finalReturn;
};
let getGenericMonthSummary = async (year, month, userid = false) => {
  // DEFAULT_WORKING_HOURS = $_ENV['DEFAULT_WORKING_HOURS'] ? $_ENV['DEFAULT_WORKING_HOURS'] : "09:00";
  let DEFAULT_WORKING_HOURS = "9:00";
  let daysOfMonth = await getDaysOfMonth(year, month, db);
//   console.log(daysOfMonth)
  for (let [kk, pp] of Object.entries(daysOfMonth)) {
    daysOfMonth[kk]["office_working_hours"] = DEFAULT_WORKING_HOURS;
  }
  daysOfMonth = await _addRequiredKeysForADay(daysOfMonth, db);
  let holidaysOfMonth = await getHolidaysOfMonth(year, month, db);
  let weekendsOfMonth = await getWeekendsOfMonth(year, month, db);
  let nonworkingdayasWorking = await getNonworkingdayAsWorking(year, month, db);
  let workingHoursOfMonth = await getWorkingHoursOfMonth(year, month, db);

  if (holidaysOfMonth.length > 0) {
    for (let [hm_key, hm] of Object.entries(holidaysOfMonth)) {
      daysOfMonth[hm_key]["day_type"] = "NON_WORKING_DAY";
      daysOfMonth[hm_key]["day_text"] = hm["name"];
    }
  }
  if (weekendsOfMonth.length > 0) {
    for (let [hm_key, hm] of Object.entries(weekendsOfMonth)) {
      daysOfMonth[hm_key]["day_type"] = "NON_WORKING_DAY";
      daysOfMonth[hm_key]["day_text"] = "Weekend Off";
    }
  }
  if (workingHoursOfMonth.length > 0) {
    for (let [hm_key, hm] of Object.entries(weekendsOfMonth)) {
      daysOfMonth[hm_key]["day_type"] = "WORKING_DAY";
      daysOfMonth[hm_key]["office_working_hours"] = hm["working_hours"];
    }
  }
  if (userid != false) {
    userWorkingHours = await getUserMangedHours(userid);
    if (userWorkingHours.length > 0) {
      for (let [key, dm] of Object.entries(daysOfMonth)) {
        for (let [hm_key, hm] of Object.entries(userWorkingHours)) {
          if (dm["full_date"] == hm["date"]) {
            daysOfMonth[key]["day_text"] = hm["reason"];
            daysOfMonth[key]["office_working_hours"] = hm["working_hours"];
            if (hm["working_hours"] == "00:00") {
              daysOfMonth[key]["day_type"] = "NON_WORKING_DAY";
            } else {
              daysOfMonth[key]["day_type"] = "WORKING_DAY";
            }
          }
        }
      }
    }
  }
  for (let [key, dom] of Object.entries(daysOfMonth)) {
    if (dom["office_working_hours"] != "") {
      explodeDayWorkingHours = dom["office_working_hours"].split(":");
      explodeDay_hour = explodeDayWorkingHours[0] * 60 * 60;
      explodeDay_minute = explodeDayWorkingHours[1] * 60;
      orignal_total_time = int(explodeDay_hour + $explodeDay_minute);
      daysOfMonth[key]["orignal_total_time"] = orignal_total_time;
    }
  }
  return daysOfMonth;
};
let getDaysOfMonth = async (year, month) => {
  let list = [];
  for (d = 1; d <= 31; d++) {
    let date = new Date();
    date.setHours(12);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMonth(month);
    date.setDate(d);
    date.setFullYear(year);
    if (date.getMonth() == month) {
      let c_full_date = date;
      let c_date = date.getDate();
      let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let c_day = days[new Date(date).getDay()];
      let row = {};
      row.full_date = c_full_date;
      row.date = c_date;
      row.day = c_day;
      list[c_date]=row;
    }
  }
  return list;
};
let _addRequiredKeysForADay = async (days) => {
  let Return = [];
  for (let [k, day] of Object.entries(days)) {
    day["day_type"] = "WORKING_DAY";
    day["day_text"] = "";
    day["in_time"] = "";
    day["out_time"] = "";
    day["total_time"] = "";
    day["extra_time"] = "";
    day["text"] = "";
    day["admin_alert"] = "";
    day["admin_alert_message"] = "";
    Return.push(day);
  }
  return Return;
};
let getHolidaysOfMonth = async (year, month, models) => {
  let q = await models.sequelize.query(`SELECT * FROM holidays`, {
    type: QueryTypes.SELECT,
  });
  let list = [];
  for (let pp of q) {
    let h_date = new Date(pp["date"]);
    let h_month = h_date.getMonth();
    let h_year = h_date.getFullYear();
    if (h_year == year && h_month == month) {
      let h_full_date = h_date;
      h_date = h_date.getDate();
      pp["date"] = h_date;
      pp["full_date"] = h_full_date; // added on 27 for days between leaves
      list[h_date] = pp;
    }
  }
  return list;
};
let getWeekendsOfMonth=async(year,month,db)=>{
  let monthDays = await getDaysOfMonth(year, month,db);
  let list=[];
  for(let[k,v] of Object.entries(monthDays)){
      if(v.day=='Sunday'){
        list[k] = v;  
      }
    }
    let list2=await getWorkingHoursOfMonth(year,month,db)

    
}
let getWorkingHoursOfMonth=async(year,month,db)=>{
    let q = await db.sequelize.query('SELECT * FROM working_hours',{type:QueryTypes.SELECT});
    let list = [];
    for(pp of (q)){
        let h_date = new Date(pp['date']);
        let h_month = h_date.getMonth();
        let h_year = h_date.getFullYear();
        if (h_year == year && h_month == month) {
            let h_full_date = h_date;
            h_date = h_date.getDate();
            pp['date'] = h_date;
            list[h_date]=pp;
        }
    }
    return list;
}
module.exports = {
  _getPreviousMonth,
  getEmployeeLastPresentDay,
};
