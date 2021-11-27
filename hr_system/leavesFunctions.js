const jwt = require("jsonwebtoken");
const secret = require("./config.json");
const { Op, QueryTypes, json } = require("sequelize");
const db = require("./db");
const { sequelize } = require("./db");
const { MachineStatusDeleteValidator } = require("./validators/req-validators");
const user = require("./models/userModel");
const { Query } = require("pg");
const { object } = require("webidl-conversions");
const e = require("express");

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
  for(let [k,v] of Object.entries(genericMonthDays)) {
      console.log(k,v);
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
  return finalReturn;
};
let getGenericMonthSummary = async (year, month, userid = false,db) => {
  // DEFAULT_WORKING_HOURS = $_ENV['DEFAULT_WORKING_HOURS'] ? $_ENV['DEFAULT_WORKING_HOURS'] : "09:00";
  let DEFAULT_WORKING_HOURS = "9:00";
  let daysOfMonth = await getDaysOfMonth(year, month, db);
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
    userWorkingHours = await getUserMangedHours(userid,db);
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
      orignal_total_time = (explodeDay_hour + explodeDay_minute);
      daysOfMonth[key]["orignal_total_time"] = orignal_total_time;
    }
  }
  return daysOfMonth;
};
 let  getNonworkingdayAsWorking=async(year, month,db)=> {
    let list ;
    list = await getWorkingHoursOfMonth(year, month,db);
    return list;
}

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
 let   getUserMangedHours=async(userid,db)=> {
    let rows = (`SELECT * FROM user_working_hours WHERE user_Id = userid order by id DESC`,{type:QueryTypes.SELECT});
    return rows;
} 
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
    let list2=await getWorkingHoursOfMonth(year,month,db);
    let arr=[];
    for(key in list){
      if(list2.includes(key)){
       arr[key].push(list2[key]);
      }
    }
    return arr;

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
 let getUserMonthPunching=async(userid, year, month,db)=>{
    let list = [];
    let rows = await db.sequelize.query(`SELECT * FROM attendance Where user_id = ${userid}`,{type:QueryTypes.SELECT});
    let allMonthAttendance = [];
    for(let d of rows ) {
        let d_timing = d['timing'];
        d_timing = d_timing.replace("-","/")
        d_timing=new Date(d_timing)
        // check if date and time are not there in string
        if( d_timing.length < 10 ){

        } else {
            let d_full_date = new Date(d_timing.getFullYear(), d_timing .getMonth(), d_timing .getDate());
            let d_timestamp = (d_timing).getTime();
            let d_month=(d_timing).getMonth();
            let d_year = d_timing.getFullYear();
            let d_date = d_timing.getDate()
            if (d_year == year && d_month == month) {
                d['timestamp'] = d_timestamp;
                allMonthAttendance[d_date]=[];
                allMonthAttendance[d_date]=d;
            }

        }
    }

    // // added on 5jan2018----
    let genericMonthDays = await getGenericMonthSummary(year, month, userid,db); // $userid added on 5jan2018 by arun so as to use user working hours
    
    // // userMonthLeaves is added to get the working hours for halfday
    let userMonthLeaves = await getUserMonthLeaves(userid,year,month,db);

    // foreach ($allMonthAttendance as $pp_key => $pp) {
    //     $dayW_hours = false;
    //     if( isset($genericMonthDays[$pp_key]) && isset($genericMonthDays[$pp_key]['office_working_hours'])){
    //         $dayW_hours = $genericMonthDays[$pp_key]['office_working_hours'];
    //     }
    //     // check if day is a leave and it is half day then daywhours will be 04:30 hours
    //     if( isset($userMonthLeaves[$pp_key]) && isset($userMonthLeaves[$pp_key]['no_of_days']) && $userMonthLeaves[$pp_key]['no_of_days'] == '0.5' ){
    //         $dayW_hours = '04:30';
    //     }
    //     $daySummary = self::_beautyDaySummary($pp, $dayW_hours);
    //     $list[$pp_key] = $daySummary;
    // }
    // return $list;
}
let getUserMonthLeaves=async(userid,year,month,db)=>{
        let list = [];
        let rows = await db.sequelize.query(`SELECT * FROM leaves Where user_Id = ${userid}`,{type:QueryTypes.SELECT});
        for (let pp of rows) {
            let pp_start = pp['from_date'];
            let pp_end = pp['to_date'];
            let datesBetween = await _getDatesBetweenTwoDates(pp_start, pp_end);
            for(d of datesBetween) {
                let h_month = d.getMonth();
                let h_year = d.getFullYear()

                if (h_year == year && h_month == month) {
                   let h_full_date = new Date(d);
                   let h_date = d.getDate()
                    list[h_date] = pp;
                }
            }
        }
        // console.log(list)
        // ksort($list);


        // ///// remove non working days from leaves
        // $monthHolidays = self::getHolidaysOfMonth($year, $month);
        // $monthWeekends = self::getWeekendsOfMonth($year, $month);
        // if (sizeof($monthHolidays) > 0) {
        //     foreach ($monthHolidays as $d => $v) {
        //         if (array_key_exists($d, $list)) {
        //             unset($list[$d]);
        //         }
        //     }
        // }
        // if (sizeof($monthWeekends) > 0) {
        //     foreach ($monthWeekends as $w => $v2) {
        //         if (array_key_exists($w, $list)) {
        //             unset($list[$w]);
        //         }
        //     }
        // }

        return list;
}
let  _getDatesBetweenTwoDates=async(startDate, endDate)=>{
    startDate=new Date(startDate);
    Return = [];
    Return.push(startDate)
    let start =startDate;
    let i = 1;
    if (startDate.getTime() < new Date(endDate).getTime()) {
        while (start.getTime() < new Date(endDate).getTime()) {
            // console.log(start,endDate)
            let date=startDate.getDate();
            date=date+i;
            start =startDate.setDate(date)
            start=new Date(start);
            Return.push(start);
            i++;
        }
    }
    // console.log(Return)
    return Return;
}
let API_deleteHoliday=async(holiday_id,db)=>{
    let r_error = 0;
    r_data ={}
    let Return = {};
    let holiday = await getHolidayDetails(holiday_id,db);        
    if((holiday).length > 0 ){
        let q = await db.sequelize.query(` DELETE FROM holidays WHERE id = 'holiday_id'`,{type:QueryTypes.DELETE})
        r_data.message = "Holiday Deleted Successfully.";
    } else {
        r_error = 1;
        r_data.message = "Holiday not Found.";
    }
    Return.error= r_error;
    Return.data= r_data;
    return Return;
};
let getHolidayDetails=async(holiday_id,db)=>{
    let q = await db.sequelize.query(` SELECT * from holidays WHERE id = '${holiday_id}' `,{type:QueryTypes.SELECT});
    console.log(q)
    return q;
}
let addHoliday=async(name,date,type,db)=>{
    console.log(12213425)
    let r_error = 0;
    let r_data = {};
    let Return = {};

    if((name) || name == ""){
        r_data.message = "Please provide holiday name.";

    } else if ((date) || date == ""){
        r_data.message = "Please provide a holiday date.";

    } else if ((type) || type == ""){
        r_data.message= "Please provide holiday type.";

    } else {
        
        date = new Date(date);
        let rows = await db.sequelize.query(`SELECT * from holidays where date = '${date}'`,{type:QueryTypes.SELECT});
        if( rows.length > 0 ){
            r_error = 1;
            r_data.message = "Date Already Exists.";

        } else {
            let insert_holiday = await db.sequelize.query(`Insert into holidays VALUES (${name}, ${date}, ${type}`,{type:QueryTypes.INSERT})
            console(insert_holiday)
            r_data.message = "Holiday inserted successfully.";
        }
    }

    Return.error= r_error,
    Return.data=r_data
    console.log(Return)
    return Return;
}
let getHolidayTypesList=async(db)=>{
    let list = [
        {
            type:0,text:'Normal'
        },
        {
            type:1,text:'Restricted'
        }  
    ]
    return list;

}
let API_getHolidayTypesList=async(db)=>{
    let r_error = 0;
    let r_data = {}
    r_data.holiday_type_list = await getHolidayTypesList(db);
    let Return = {}
     Return.error=r_error;
     Return.data= r_data;
    return Return;
}

 let API_getYearHolidays=async(year,db)=>{
    if (year == false) {
      year= new Date().getFullYear()
    }
    let rows =await db.sequelize.query(`SELECT * FROM holidays`,{type:QueryTypes.SELECT});
    let list = [];
    
    let type_text = await getHolidayTypesList(db);

    if (year == false) {
        list = rows;
    } else {
        for(let pp of rows){
            let h_date = pp['date'];
            h_date=new Date(h_date)
            h_year =h_date.getFullYear();
            for(let text of type_text){
                if( pp['type'] == text['type'] ){
                    pp['type_text'] = text['text'];
                }
            }
            if (h_year == year) {
                list.push(pp)
            }                
        }
    }
    // if (list.length > 0) {
        for(let [key,v] of Object.entries(list) ) {
            list[key]['month'] = new Date(v['date']).toLocaleString('default', { month: 'long' })
            list[key]['dayOfWeek'] = new Date(v['date']).toLocaleString('default', {weekday: 'long' })
          }
    // }

    
    let r_error = 0;
    let r_data = {};
    let Return = {};
    Return['error'] = r_error;
    r_data['message'] = "";
    r_data['holidays'] = list;
    Return['data'] = r_data;
    return Return;
 }
 let cancelAppliedLeave=async(req,db)=>{
  try{
  let r_error = 1;
  let r_message = "";
  let r_data ={};
  let user_id = req.body['user_id'];
  let leave_start_date = new Date(req.body['date']);
  let current_date = new Date();
  let time1=current_date.getTime();
  let time2=leave_start_date.getTime()
  if(time1 < time2){
    leave_start_date=(leave_start_date.toISOString().split('T')[0])
    let row2=await db.sequelize.query(`SELECT * FROM leaves WHERE user_Id= ${user_id}  AND from_date= '${leave_start_date}' AND (status = 'Approved' OR status = 'Pending')`,{type:QueryTypes.SELECT});
    if(row2.length>0){
      let q2 = await db.sequelize.query(`UPDATE leaves SET status = 'Cancelled Request' WHERE id=${row2[0]['id']}`,{type:QueryTypes.UPDATE});
                r_error = 0;
                r_message = `Your applied leave for ${req.body['date']} has been cancelled`;
                r_data['message'] = r_message;
    }else{
      r_error = 1;
      r_message = `No Leave applied on ${req.body['date']} or it has been cancelled already`
      r_data['message'] = r_message;
    }

  }else{
    r_error = 1;
    r_message = `You cannot cancel leave of  ${req.body['date'] } .Contact HR for cancellation`;
    r_data['message'] = r_message;
  }
  let Return = {};
  Return['error'] = r_error;
  Return['data'] = r_data;
  return Return;
  
  }catch(error){
    console.log(error);
  }
 }

module.exports = {
  _getPreviousMonth,
  getEmployeeLastPresentDay,API_deleteHoliday,addHoliday,getHolidayTypesList,API_getHolidayTypesList,API_getYearHolidays,cancelAppliedLeave
};
