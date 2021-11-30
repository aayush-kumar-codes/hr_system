const jwt = require("jsonwebtoken");
const secret = require("./config.json");
const { Op, QueryTypes, json } = require("sequelize");
const db = require("./db");
const { sequelize } = require("./db");
const user = require("./models/userModel");
const { Query } = require("pg");
const { object } = require("webidl-conversions");
// const leapYear = require('leap-year');
const e = require("express");
const {getUserInfo}=require("./allFunctions");
const{getEmployeeCompleteInformation}=require("./employeeFunction")
const { query } = require("express");

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
  monthDetails = monthDetails.reverse();
  for(let [k,md] of monthDetails ){
      if( md['day_type'] == 'WORKING_DAY' && ( md['in_time'] || md['out_time'] )  ){
          Return = md;
          break;
      }
  }
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
    if ((k) in userMonthPunching ) {
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
    if (k in userMonthLeaves) {
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
  let holidaysOfMonth = await getHolidaysOfMonth(year, month, db);
  let weekendsOfMonth = await getWeekendsOfMonth(year, month, db);//done
  let nonworkingdayasWorking = await getNonworkingdayAsWorking(year, month, db);//done
  let workingHoursOfMonth = await getWorkingHoursOfMonth(year, month, db);//done
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
    let h_month = h_date.getMonth()+1;
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
        let h_month = h_date.getMonth()+1;
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
    for(let[key,d] of Object.entries(rows) ) {
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
    for(let[pp_key,pp] of Object.entries(allMonthAttendance)) {
        let dayW_hours = false;
        if((genericMonthDays[pp_key]) && genericMonthDays[pp_key]['office_working_hours']){
            dayW_hours = genericMonthDays[pp_key]['office_working_hours'];
        }
        // check if day is a leave and it is half day then daywhours will be 04:30 hours
        if( userMonthLeaves[pp_key] && userMonthLeaves[pp_key]['no_of_days'] && userMonthLeaves[pp_key]['no_of_days'] == '0.5' ){
            dayW_hours = '04:30';
        }
        // console.log("_beautyDaySummary function is not complete yet to work on it ")
        let daySummary = await _beautyDaySummary(pp,dayWorkingHours=false,db);
        list[pp_key] = daySummary;
    }
    return list;
}; 
let _beautyDaySummary=async(dayRaw,dayWorkingHours = false,db)=>{
  let TIMESTAMP = '';
  let numberOfPunch = dayRaw.length;
  let timeStampWise = [];
      TIMESTAMP = dayRaw['timestamp'];
      timeStampWise[dayRaw['timestamp']] = dayRaw;
  // sort on the basis of timestamp 
    timeStampWise.sort();
  // inTimeKey = key(timeStampWise);
  // end(timeStampWise);
  // $outTimeKey = key($timeStampWise);
  // // employee in time   
  // $inTime = date('h:i A', $inTimeKey);
  // // employee out time   
  // $outTime = date('h:i A', $outTimeKey);
  // $r_date = (int) date('d', $TIMESTAMP);
  // $r_day = date('l', $TIMESTAMP);
  // $r_total_time = $r_extra_time_status = $r_extra_time = '';
  // // total no of hours present  
  // $r_total_time = (int) $outTimeKey - (int) $inTimeKey;
  // // extra time  
  // $r_extra_time = (int) $r_total_time - (int) ( 9 * 60 * 60 );
  // if ($r_extra_time < 0) { // not completed minimum hours
  //     $r_extra_time_status = "-";
  //     $r_extra_time = $r_extra_time * -1;
  // } else if ($r_extra_time > 0) {
  //     $r_extra_time_status = "+";
  // }
  // $return = array();
  // $return['in_time'] = $inTime;
  // $return['out_time'] = $outTime;
  // $return['total_time'] = $r_total_time;
  // $return['extra_time_status'] = $r_extra_time_status;
  // $return['extra_time'] = $r_extra_time;
  // return $return;
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

        // ksort($list); sorts associative array in assending order
        ///// remove non working days from leaves
        let monthHolidays = await getHolidaysOfMonth(year,month,db);
        let monthWeekends = await getWeekendsOfMonth(year,month,db);
        if (monthHolidays.length > 0) {
            for(let[d,v] of Object.entries(monthHolidays)) {
                if (d in list) {
                    delete list[d];
                }
            }
        }
        if (monthWeekends.length > 0) {
            for (let[w,v2] of monthWeekends) {
                if (w in list) {
                    delete list[w];
                }
            }
        }
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
    return q;
}
let addHoliday=async(name,date,type,db)=>{
  try{
    let r_error = 0;
    let r_data = {};
    let Return = {};

    if((!name) || name == ""){
        r_data.message = "Please provide holiday name.";

    } else if ((!date) || date == ""){
        r_data.message = "Please provide a holiday date.";

    } else if ((!type) || type == ""){
        r_data.message= "Please provide holiday type.";

    } else {
     date=date.split("T")[0]
        let rows = await db.sequelize.query(`SELECT * from holidays where date = '${date}'`,{type:QueryTypes.SELECT});
        if( rows.length > 0 ){
            r_error = 1;
            r_data.message = "Date Already Exists.";

        } else {
            let insert_holiday = await db.sequelize.query(`INSERT INTO holidays (name,date,type) VALUES ('${name}', '${date}', '${type}')`,{type:QueryTypes.INSERT})
            r_data.message = "Holiday inserted successfully.";
        }
    }

    Return.error= r_error,
    Return.data=r_data
    return Return;
  }catch(error){
    console.log(error)
  }
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
 let API_getMyRHLeaves=async(userid,year,db)=>{
  let r_error = 0;
  let r_data ={};
  if( !year || year == "" ){
      year = new Date.getFullYear();
  }
  let rhList = await getMyRHLeaves( year,db);
  let rhLeaves = await getUserRHLeaves( userid, year,db);
  if( rhList.length > 0 ){       
      for(let[key,rh] of Object.entries(rhList)){
          rhList[key]['status'] = "";
          for( let rhLeave of rhLeaves){
              if( rhLeave['from_date'] == rh['raw_date'] ){
                  rhList[key]['status'] = rhLeave['status'];
              }
          }
      }     
      r_data['rh_list'] = rhList;
  } else {
      r_data['message'] = "Restricted holidays not found for " . year;
  }
  let Return = {}
  Return.error = r_error;
  Return.data= r_data;
  return Return;
 }
 let getUserRHLeaves=async(userid, year,db)=>{
  let rows = await db.sequelize.query(`SELECT * FROM leaves WHERE leave_type = 'Restricted' AND user_Id = '${userid}' AND from_date LIKE '${year}%'`,{type:QueryTypes.SELECT});
  return rows;
 }
let getMyRHLeaves=async(year,db)=>{
  let rows = await db.sequelize.query(`SELECT * FROM holidays WHERE type = 1 AND date LIKE '${year}%' ORDER BY date ASC `,{type:QueryTypes.SELECT});       
  if(rows.length > 0 ){
    let rhType = await getHolidayTypesList();
    let i=0;
      for( let[key,row] of Object.entries(rows)){
          for(let type of rhType ){
              if( row['type'] == type['type'] ){
                  rows[key]['type_text'] = type['text'];
              }
          }
          rows[key]['raw_date'] = row['date'];
          rows[key]['day'] = row['date'].toLocaleString('default', {weekday: 'long' })
          rows[key]['month'] = row['date'].toLocaleString('default', { month: 'long' })
          let explodeRawDate =row['date'].split('-')
          rows[key]['date'] = explodeRawDate[2]+-+`${rows[key]['month']}`+-+explodeRawDate[0];
      }
  }   
  return rows;
}
let applyLeave=async(userid, from_date, to_date, no_of_days, reason, day_status, leave_type, late_reason, pending_id = false, doc_link = false, rh_dates = false)=>{
  let Return={};
  let r_message;
  let r_error;
  let success;
  from_date=new Date(from_date)
  let from_date_year = from_date.getFullYear();
  let leave_dates = await _getDatesBetweenTwoDates(from_date, to_date);

  // Check for RH Quarterwise
  if( leave_type.toLowerCase() == 'restricted' ){
      let rh_check =await checkRHQuarterWise(userid, from_date);
      if( rh_check['check'] ){
        Return.error=1;
        Return.data={};
        Return.data.message= rh_check['message'];
          return Return;
      }
  }

  // Check for RH Compensation
  if(leave_type.toLowerCase() == 'rh compensation' ){                                                      
      let rh_compensation_check = await isEligibleForRHCompensation( userid, from_date_year, no_of_days, rh_dates);
          for(let ld of leave_dates){
              for(let rh of rh_dates) {
           if( rh.getTime()  > ld.getTime()) {
            Return.error=1;
            Return.data={};
            Return.data.message= `The RH selected on the RH Date: ${rh}  should be before the leave Date: ${ld} `
              return Return;
            } 
          }
        }           
      rh_dates = JSON.parse(rh_dates);
      if( !rh_compensation_check['check'] ){
        Return.error=1;
        Return.data={};
        Return.data.message= rh_compensation_check['message']
          return Return;
      }
  }

  let alert_message = "N/A";
  let check = await checkLeavesClashOfSameTeamMember( userid, from_date, to_date );
  if( check ){
      alert_message = "Another team member already has applied during this period so leave approve will depend on project.";
  }
  
  let applied_date = new Date();
  applied_date =JSON.stringify(applied_date ).split("T")[0]
  applied_date =(applied_date .substr(1,11))
  let originalText_reason = reason;
  let originalText_late_reason = late_reason;
  from_date=JSON.stringify(from_date).split("T")[0]
 from_date=(from_date.substr(1,11))
  let q = await db.sequelize.query(`INSERT into leaves ( user_Id, from_date, to_date, no_of_days, reason, status, applied_on, day_status,leave_type,late_reason, doc_link, rh_dates ) VALUES ( ${userid}, '${from_date}', '${to_date}', ${no_of_days}, '${reason}', 'Pending', '${applied_date}', '${day_status}','${leave_type}','${late_reason}', '${doc_link}', '${rh_dates}' )`,{type:QueryTypes.INSERT});        
  if(q[0]){
    leave_id=q[0];
    success = true;
    r_message = "Leave applied.";
  }else{
    r_error = 1;
    r_message = "Error in applying leave.";
  }
  if (r_error == 0) {
      if (pending_id != false) {
          if ( await manipulatingPendingTimeWhenLeaveIsApplied( pending_id, no_of_days ) ) {
              q = await db.sequelize.query(`Select * from users_previous_month_time where id = ${pending_id}`,{type:QueryTypes.SELECT});
              oldStatus = row[0]['status'];
              q1 = await db.sequelize.query(`UPDATE users_previous_month_time SET status = '${oldStatus} - Leave applied for previous month pending time', status_merged = 1  Where id = ${pending_id}`,{type:QueryTypes.UPDATE})
          }
      }

  //     $numberOfDays = "";
  //     if ($day_status == "2") {
  //         $numberOfDays = "second half day";
  //     } elseif ($day_status == "1") {
  //         $numberOfDays = "first half day";
  //     } else {
  //         $numberOfDays = "$no_of_days days";
  //     }
  //     if ($late_reason == "") {
  //         $late_reason = "N/A";
  //     }

  //     /* send message to employee and admin/hr*/
  //     $messageBody = array(
  //         "numberOfDays" => $numberOfDays,
  //         "fromDate" => $from_date,
  //         "toDate" => $to_date,
  //         "reason" => $originalText_reason,
  //         "alertMessage" => $alert_message,
  //         "lateReason" => $originalText_late_reason,
  //         "docLink" => $doc_link,
  //         "leave_type" => $leave_type
  //     );
  //     $slackMessageStatus = self::sendNotification( "apply_leave", $userid, $messageBody);

  //     /* send email */
  //     $userInfo = self::getEmployeeCompleteInformation($userid);
  //     $templateData = array_merge($messageBody, $userInfo);
  //     $emailData = array();
  //     $emailData['sendEmail'] = array(
  //         "to" => array($userInfo['work_email']),
  //         "cc" => self::getEmailCCList("Leave apply")
  //     );
  //     $emailData['templatekey'] = "Leave apply";
  //     $emailData['templateSubject'] = "";
  //     $emailData['templateData'] = $templateData;
  //     self::sendTemplateEmail($emailData);
  // }
  // $return = array();
  // $r_data = array();
  // $return['error'] = $r_error;
  // $r_data['message'] = $r_message;
  // $r_data['leave_id'] = $leave_id;
  // $return['data'] = $r_data;
  // return $return;
}
}
// let checkLeavesClashOfSameTeamMember=async()
let checkRHQuarterWise=async()=>{
  let check = false;
  let Return = {};
  let rh_config = await getConfigByType('rh_config');
  let no_of_quaters =(await getAllQuarters()).length
  let rh_extra = rh_config['rh_extra'];        
  let rh_can_be_taken_per_quarter = rh_config['rh_per_quater'];
  let rh_can_be_taken = no_of_quaters * rh_can_be_taken_per_quarter;
  let max_rh_can_be_taken_per_quarter = rh_can_be_taken_per_quarter;
  let user = await getUserInfo(userid);    

  // if( $user['training_completion_date'] != null && $user['training_completion_date'] != '0000-00-00' && $user['training_completion_date'] != '1970-01-01' && strtotime($user['training_completion_date']) < time() ) {
      
  //     $from_date_year = date('Y', strtotime($from_date));
  //     $from_date_month = date('m', strtotime($from_date));
  //     $current_date = date('Y-m-d');
  //     $current_year = date('Y');
  //     $current_month = date('m');
  //     $current_quarter = self::getQuarterByMonth();
  //     $confirm_year = date('Y', strtotime($user['training_completion_date']));
  //     $confirm_month = date('m', strtotime($user['training_completion_date']));
  //     $confirm_quarter = self::getQuarterByMonth($confirm_month);
  //     $from_date_quarter = self::getQuarterByMonth( $from_date_month );
  //     $rh_leaves_all = self::getUserRHLeaves($userid, $current_year);
  //     $rh_list = array_map( function($iter){ return $iter['raw_date']; }, self::getMyRHLeaves($current_year) );
  //     $rh_leaves = array_map( function($iter){ return $iter['from_date']; }, $rh_leaves_all );
  //     $rh_approved = array_map( function($iter){ return $iter['from_date']; }, self::getUserApprovedRHLeaves($userid, $current_year) );
  //     $rh_approved_dates = array_map(function($iter){ return $iter['from_date']; }, self::getUserApprovedRHLeaves($userid, $current_year));    
  //     $rh_approved_count = array_sum(array_map( function($iter){ return $iter['no_of_days']; }, self::getUserApprovedRHLeaves($userid, $current_year) ));
  //     $rh_compensated = array_sum(array_map( function($iter){ return $iter['no_of_days']; }, self::getUserApprovedRHCompensationLeaves($userid, $current_year) ));                                    
      
  //     $rh_stats = self::getEmployeeRHStats($userid, $current_year);
  //     $max_rh_can_be_taken_per_quarter = $rh_stats['rh_can_be_taken_this_quarter'];

  //     if( $confirm_year == $current_year ){

  //         $remaining_quarters = $no_of_quaters - $confirm_quarter['quarter'];
  //         $eligible_for_confirm_quarter_rh = false;
  //         if( $confirm_quarter['months'][0] == $confirm_month ){
  //             $eligible_for_confirm_quarter_rh = true;
  //         }
  //         if( $eligible_for_confirm_quarter_rh ){
  //             $rh_can_be_taken = ($remaining_quarters + 1) * $rh_can_be_taken_per_quarter;
  //         } else {
  //             $rh_can_be_taken = $remaining_quarters * $rh_can_be_taken_per_quarter;
  //         }  

  //     } else if( $confirm_year > $current_year ) {
  //         $rh_can_be_taken = 0;
  //     }

  //     $total_rh_taken = $rh_approved_count + $rh_compensated;
  //     $apply_next_rh = true;

  //     // filter dates for calculating quarterly leave
  //     $rh_taken_per_quarter = self::getPreviousTakenRHQuaterly($userid, $from_date_year);
      
  //     if( sizeof($rh_leaves_all) > 0 ){
  //         foreach( $rh_leaves_all as $rh_leave ){
  //             if( strtolower($rh_leave['status']) == 'pending' ){
  //                 $apply_next_rh = false;
  //                 break;
  //             }
  //         }
  //     }
      
  //     if( strtotime($from_date) < strtotime($current_date) ){
  //         $message = 'You cannot apply previous RH.';                

  //     } else {
          
  //         if( in_array( $from_date, $rh_list ) ){

  //             if( $apply_next_rh ){

  //                 if( $total_rh_taken >= $rh_can_be_taken ){
  //                     $message = 'You have reached the RH quota. You are not eligible for other RH this year.';
                      
  //                 } else {
  //                     if( array_key_exists( $from_date_quarter['quarter'], $rh_taken_per_quarter ) ){
  //                         if( $rh_taken_per_quarter[$from_date_quarter['quarter']] > 0 ) {
  //                             if( $max_rh_can_be_taken_per_quarter > 0 ){
  //                                 $check = true;
  //                             } else {
  //                                 $message = "You are not allowed take another RH this quarter.";
  //                             }
  //                         }
  //                     } else {
  //                         if( $confirm_year == $current_year && $from_date_quarter['quarter'] == $confirm_quarter['quarter'] ){
  //                             if( $eligible_for_confirm_quarter_rh ){
  //                                 $check = true;
  //                             } else {
  //                                 $message = "You are not eligible for current quarter RH.";
  //                             }
  //                         } else {
  //                             $check = true;                                    
  //                         }  
  //                     }
  //                 }

  //             } else {
  //                 $message = "Your previous RH status is pending. Contact admin.";
  //             }

  //         } else {
  //             $message = "The date is not yet added in the RH list.";
  //         } 
  //     }

  // } else {
  //     $message = 'You are not a confirm employee so you are not eligible for RH';
  // }

  // $return['check'] = $check;
  // $return['message'] = $message;

  // return $return;
}

let leaveDocRequest=async(leaveid, doc_request, comment,db)=>{
  let leaveDetails = await getLeaveDetails(leaveid,db);
  let r_error = 0;
  let r_message = "";
  let message_to_user = "";
  let r_data ={};
  if(Array.isArray(leaveDetails)){
      let old_status = leaveDetails['status'];
      let from_date = leaveDetails['from_date'];
      let to_date = leaveDetails['to_date'];
      let no_of_days = leaveDetails['no_of_days'];
      let applied_on = leaveDetails['applied_on'];
      let reason = leaveDetails['reason'];
      let q;
      if (doc_request) {
          q = await db.sequelize.query(`UPDATE leaves set doc_require= 1 WHERE id = '${leaveid}' `,{type:QueryTypes.UPDATE});               
          message_to_user = "You are requested to submit doc proof for this leave";
          r_message = 'Admin request for leave doc send';
      }
      if (comment) {
           q = await db.sequelize.query(`UPDATE leaves set comment= '${comment}' WHERE id = '${leaveid}'`,{type:QueryTypes.UPDATE});
          message_to_user = comment;
          r_message = 'Admin commented on employee leave saved';
      }

      if (message_to_user != '') {
          let userid = leaveDetails['user_Id'];
          /* new notification system*/
          // $messageBody = array(
          //     "newStatus" => $old_status,
          //     "fromDate" => $from_date,
          //     "toDate" => $to_date,
          //     "noOfDays" => $no_of_days,
          //     "appliedOn" => $applied_on,
          //     "reason" => $reason,
          //     "messageFromAdmin" => $message_to_user,
          // );
          // $slackMessageStatus = self::sendNotification( "update_leave_status", $userid, $messageBody);
      

          /* send email */
          // $userInfo = self::getEmployeeCompleteInformation($userid);
          // $templateData = array_merge($messageBody, $userInfo);
          // $emailData = array();
          // $emailData['sendEmail'] = array(
          //     "to" => array($userInfo['work_email'])
          // );
          // $emailData['templatekey'] = "Leave status change";
          // $emailData['templateSubject'] = "";
          // $emailData['templateData'] = $templateData;
          // self::sendTemplateEmail($emailData);

      }
  } else {
      r_message = "No such leave found";
      r_error = 1;
  }

  Return ={};
  r_data = {};
  r_data.message = r_message;
  r_data.leaveid = leaveid;
  Return.error = r_error;
  Return.data= r_data;
console.log(Return)
  return Return;
}
let  getLeaveDetails=async(leaveid,db)=>{
  let row=await db.sequelize.query(`SELECT users.*,leaves.* FROM leaves LEFT JOIN users ON users.id = leaves.user_Id where leaves.id = '${leaveid}'`,{type:QueryTypes.SELECT})
  if(row['username']) {
      delete row['username'];
  }
  if(row['password'] ){
      delete (row['password']);
  }
  row['doc_link'] = await _getLeaveDocFullLink(row,db);
  return row;
}
let _getLeaveDocFullLink=async(leaveDetails,db)=>{
  let leaveDoc = leaveDetails['doc_link'];
  if( leaveDoc != "" && leaveDoc != "N/A" ){
      let uploadedImage = "";
      if(leaveDetails['doc_link']){
         uploadedImage = leaveDetails['doc_link'];
      }
      if( uploadedImage != "" ){
          leaveDoc = `$_ENV['ENV_BASE_URL'].'attendance/uploads/leaveDocuments/'.${leaveDetails}['doc_link'];`
      }
  }
  return leaveDoc;        
}
let updateLeaveStatus=async(leaveid, newstatus, messagetouser,db,req)=>{
  let leaveDetails = await getLeaveDetails(leaveid,db);
  let r_error = 0;
  let r_message = "";
  if(Array.isArray(leaveDetails)){
    let old_status = leaveDetails[0]['status'];
    let from_date = leaveDetails[0]['from_date'];
    let to_date = leaveDetails[0]['to_date'];
    let no_of_days = leaveDetails[0]['no_of_days'];
    let applied_on = leaveDetails[0]['applied_on'];
    let reason = leaveDetails[0]['reason'];
    let rejectedReason = "";
    if(newstatus.toLowerCase() == "rejected" ){
      rejectedReason = messagetouser;
    }
    let changeLeaveStatus1 = await changeLeaveStatus(leaveid, newstatus, rejectedReason,db); 
    if(leaveDetails[0].leave_type.toLowerCase() == 'restricted' ||leaveDetails[0].leave_type.toLowerCase() == 'rh compensation' ){
    if(changeLeaveStatus1==true ){                  
       let updatedLeaveDetails = await getLeaveDetails(leaveid,db);
        let leave_dates = await getDaysBetweenLeaves(updatedLeaveDetails[0]['from_date'], updatedLeaveDetails[0]['to_date'],db);
        if(updatedLeaveDetails[0]['status'].toLowerCase() == 'approved' ){                                                
            for(let date of leave_dates['data']['days']){                            
                // entry_time =_ENV['DEFAULT_ENTRY_TIME'] ? _ENV['DEFAULT_ENTRY_TIME'] : "10:30 AM";
                // exit_time = _ENV['DEFAULT_EXIT_TIME'] ? _ENV['DEFAULT_EXIT_TIME'] : "07:30 PM";  
                let entry_time ="10:30 AM";
                let exit_time="07:30 PM"; 
                let newdate = JSON.stringify(date['full_date'])
                newdate= newdate.split("T")[0];
                newdate=newdate.slice(1,11)         
                await insertUserInOutTimeOfDay(updatedLeaveDetails[0]['user_Id'], newdate, entry_time, exit_time, reason,db);
            }
        } else {                        
            for( date of leave_dates['data']['days'] ){                            
               await deleteUserInOutTimeOfDay( updatedLeaveDetails[0]['user_Id'], date['full_date'] );                       
            }
        }
    }
   }
   if(messagetouser == ''){
    messagetouser = "N/A";
   }
   console.log(leaveDetails,3323223323223)
   let userid = leaveDetails[0].id;
       messageBody = [];
        messageBody.newStatus =newstatus,
        messageBody.fromDate =from_date,
        messageBody.toDate =to_date,
        messageBody.noOfDays =no_of_days,
        messageBody.appliedOn =applied_on,
        messageBody.reason =reason,
        messageBody.messageFromAdmin =messagetouser

    // $slackMessageStatus = self::sendNotification( "update_leave_status", $userid, $messageBody);
   let templatekey = false;
   if(newstatus.toLowerCase() == 'rejected'){
    templatekey = "Leave rejected";
    } else if(newstatus.toLowerCase() == 'approved'){
    $templatekey = "Leave approval";
    } else if(newstatus.toLowerCase()== 'pending'){
    templatekey = "Leave pending";
    }
    let userInfo = await getEmployeeCompleteInformation(userid,req,db);
    let templateData =messageBody.concat( userInfo);
    let emailData = {}
    emailData.sendEmail= {}
    emailData.sendEmail.to =userInfo['work_email']
    emailData.templatekey= templatekey;
    emailData.templateSubject= "";
    emailData.templateData= templateData;
    // self::sendTemplateEmail(emailData);


    r_message = "Leave status changes from $old_status to $newstatus";
   console.log("end of function",122332)
  }else{
    r_message = "No such leave found";
    r_error = 1;
  }
  let Return = {}
  let r_data = {}
  Return.error= 0;
  r_data.message = r_message;
  Return.data = r_data;
  console.log(Return)
  return Return;
};


let insertUserInOutTimeOfDay=async(userid, date, inTime, outTime, reason,db, isadmin = true)=>{
 let extra_time = 0;
 let newdate=date;
//  if (isadmin == false) {
  let row = await db.sequelize.query(`select * from config where type='extra_time'`,{type:QueryTypes.SELECT});
  let no_of_rows =row.length;
  if (no_of_rows > 0) {
      let extra_time = row[0]['value'];
  }
  let row2= await db.sequelize.query(`select * from hr_data where user_id= ${userid} AND date = '${newdate}' `,{type:QueryTypes.SELECT});
  // outTime=outTime.split(" ")[0]
  // outHours=outTime.split(":")[0]
  // outMins=outTime.split(":")[1]
  // console.log(outHours,outMins,12)
  // let exitTime=new Date().setHours(outHours)
  // exitTime=new Date().setMinutes(outMins)
  // console.log(exitTime,122112)
  // // exitTime.setHours()
  // console.log(new Date (exitTime),2322)
  // if (row2.length > 0) {
    // let entryTime=(inTime.split(" ")[0]);
    // let inHours=entryTime.split(":")[0]
    // let inMins=entryTime.split(":")[1]
    // console.log(mins,hours,122)
      if (!row2['entry_time']) {
       inTime=inTime.split(" ")[0]
       let inHours=inTime.split(":")[0]
       let inMins =inTime.split(":")[1]

      }
      if (!row2['exit_time']) {
        outTime=outTime.split(" ")[0]
        let outHours=outTime.split(":")[0]
        let outMins =outTime.split(":")[1]
      }
      
  // } else {
    //    outTime1=outTime.split(" ")[0]
        // let outHours=outTime1.split(":")[0]
        // let outMins =outTime1.split(":")[1]
  // //     let outTime = date("h:i A", strtotime($outTime) - ($extra_time * 60));
  // }
// }
        let previous_entry_time = "";
        let previous_exit_time = "";
        let existingDetails = await getUserDaySummary(userid,date,db);
        if (existingDetails['data']) {
            previous_entry_time = existingDetails['data']['entry_time'];
            previous_exit_time = existingDetails['data']['exit_time'];
        }
        let r_error = 1;
        let r_message = "";
        let r_data = {};
        if (inTime != '') {
          inTime1 = date +' ' +inTime;
          insertInTime = new Date(inTime1)
        await insertUserPunchTime(userid, insertInTime, db);
      }
      if (outTime != '') {
          outTime1 = date + ' ' +outTime;
          insertOutTime = new Date(inTime1);
          // $insertOutTime = date('m-d-Y h:i:sA', strtotime($outTime1));
          await insertUserPunchTime(userid, insertOutTime,db);
      }
      let h=inTime.split(":")[0]
      let m=inTime.split(":")[1]
      inTime=new Date().setHours(h)
      inTime=new Date().setMinutes(m)
      if (inTime != '' && outTime != '') {
        let h_date =new Date(date);
        await insertUpdateHr_data(userid, h_date, inTime, outTime,db);
        let punchInTimeMessage = "";
        let punchOutTimeMessage = "";
        if (previous_entry_time != '' && previous_entry_time != inTime) {
            punchInTimeMessage = "Entry Time - From $previous_entry_time to ${inTime} \n ";
        } else {
            punchInTimeMessage = "Entry Time - ${inTime} \n ";
        }
        if (previous_exit_time != '' && previous_exit_time != outTime) {
            punchOutTimeMessage = "Exit Time - From $previous_exit_time to ${outTime} \n ";
        } else {
            punchOutTimeMessage = "Exit Time - ${outTime} \n";
        }
        // $messageBody = array(
        //     "date" => $h_date,
        //     "punchInTime" => $punchInTimeMessage,
        //     "punchOutTime" => $punchOutTimeMessage,
        //     "reason" => $reason
        // );
        // $slackMessageStatus = self::sendNotification( "update_employee_punch_timings", $userid, $messageBody);
    }
    r_error = 0;
    let Return ={};
    Return.error = r_error;
    r_data['message'] = r_message;
    Return.data = r_data;

    return Return;
}
let insertUpdateHr_data=async(userid, date, entry_time, exit_time,db)=>{

  //d-m-Y
  let rows =await db.sequelize.query(`SELECT * FROM hr_data WHERE user_id = '${userid}' AND date= '${date}'`,{type:QueryTypes.SELECT});

  if (rows.length > 0) {
      //update
      let q = await db.sequelize.query(`UPDATE hr_data set entry_time='${entry_time}', exit_time='${exit_time}' WHERE user_id = '${userid}' AND date = '${date}' `,{type:QueryTypes.UPDATE});
  } else {
      //insert
      userInfo = await getUserInfo(userid,db);
      emailid = userInfo['work_email'];
      q = await db.sequelize.query(`INSERT into hr_data ( user_id, email, entry_time, exit_time, date  ) VALUES ( '${userid}', '${emailid}', '${entry_time}', '${exit_time}', '${date}' )`,{type:QueryTypes.INSERT});
  }
  return true;
}
let insertUserPunchTime=async(user_id, timing)=>{
  // $q = "INSERT into attendance ( user_id, timing ) VALUES ( $user_id, '$timing')";
  // self::DBrunQuery($q);
  // return true;
  let q =await db.sequelize.query(`SELECT * FROM attendance WHERE user_id = '${user_id}' AND timing = '${timing}' `,{type:QueryTypes.SELECT});
  if( q.length < 1 ){
      q = await db.sequelize.query(`INSERT into attendance ( user_id, timing ) VALUES ( '${user_id}', '${timing}') `,{type:QueryTypes.INSERT});
  }
  return true;
}
 
let getUserDaySummary=async(userid, date,db)=>{
  let userInfo =await getUserInfo(userid,db);
  let r_error = 1;
  let r_message = "";
  let r_data = {};

  let userDayPunchingDetails =await getUserDayPunchingDetails(userid, date,db);
  r_data.name = userInfo.name;
  // $r_data.profileImage =await _getEmployeeProfilePhoto(userInfo);
  r_data.userid = userid;
  r_data.year = userDayPunchingDetails.year;
  r_data.month = userDayPunchingDetails.month;
  r_data.monthName = userDayPunchingDetails.monthName;
  r_data.day = userDayPunchingDetails.day;
  r_data.entry_time = userDayPunchingDetails.in_time;
  r_data.exit_time = userDayPunchingDetails.out_time;

  r_data.total_working = '';

  if (userDayPunchingDetails['total_time']) {
      let aa = await _secondsToTime(userDayPunchingDetails['total_time'],db);
      r_data['total_working'] = aa['h'] + 'h : ' + aa['m'] + 'm :' + aa['s'] + 's';
  }

  r_error = 0;
  Return = {};
  Return.error = r_error;
  r_data['message'] = r_message;
  Return.data = r_data;
  return Return;
};

let  _secondsToTime=async(seconds,db)=>{
  // $padHours == true will return with 0 , ie, if less then 10 then 0 will be attached
  let status = "+";

  if( seconds * 1 < 0 ){
      seconds = seconds * -1;
      status = "-";
  }

  // extract hours
  let hours = Math.trunc(seconds / (60 * 60));

  // extract minutes
  let divisor_for_minutes = seconds % (60 * 60);
  let minutes = Math.trunc(divisor_for_minutes / 60);

  // extract the remaining seconds
  let divisor_for_seconds = divisor_for_minutes % 60;
   seconds = ceil(divisor_for_seconds);

  // return the final array
  let obj = {}
      obj.h = hours;
      obj.m = minutes;
      obj.s = seconds;
      obj.status=status;

  let padData = {}
  padData.h= hours;
  padData.m = minutes;
  padData.s= second;
  if( hours < 10 ){
      padData['h'] = '0'+hours;    
  }
  if( minutes < 10 ){
      padData['m'] = '0'+minutes;    
  }
  if( seconds < 10 ){
      padData['s'] = '0'+seconds;    
  }
      
  obj["pad_hms"] = padData;
  return obj;
}

let getUserDayPunchingDetails=async(userid, date,db)=>{
 let requested_date =new Date(date).getDate()
 let requested_month = new Date(date).getMonth()
 let requested_year = new Date(date).getFullYear()
 let requested_month_name =new Date(date).toLocaleString('default', { month: 'long' })
 let requested_day =new Date(date).toLocaleString('default', { weekday: 'long' })
  let userMonthPunching =await getUserMonthPunching(userid, requested_year, requested_month,db);
  let r_in_time = r_out_time = r_total_time = '';
  let r_extra_time_status = r_extra_time = '';

  // if (requested_date in userMonthPunching) {
  //     let dayPunchFound = userMonthPunching[requested_date];
  //     r_in_time = dayPunchFound['in_time'];
  //     r_out_time = dayPunchFound['out_time'];
  //     r_total_time = dayPunchFound['total_time'];
  //     r_extra_time_status = dayPunchFound['extra_time_status'];
  //     r_extra_time = dayPunchFound['extra_time'];
  // }

  Return = {}
  Return.year=requested_year;
  Return.month=requested_month;
  Return.monthName=requested_month_name;
  Return.date=requested_date;
  Return.day=requested_day;
  Return.in_time=r_in_time;
  Return.out_time=r_out_time;
  Return.total_time=r_total_time;
  Return.extra_time_status=r_extra_time_status;
  Return.extra_time=r_extra_time;
  return Return;
}

let deleteUserInOutTimeOfDay=async( userid, date, isadmin = true,db)=>
{
    let newdate = JSON.stringify(date['full_date'])
    newdate= newdate.split("T")[0];
    newdate=newdate.slice(1,11)      
    let q = await db.sequelize.query(`SELECT * FROM attendance WHERE user_id = '${userid}' AND timing LIKE '%${newdate}%'`,{type:QueryTypes.SELECT});             
    if( sizeof($rows) > 0 ){
        let q =await db.sequelize.query(`DELETE FROM attendance WHERE user_id = '${userid}' AND timing LIKE '%${newdate}%'`,{type:QueryTypes.DELETE});
    }
    return true;
}

let  getDaysBetweenLeaves=async(startDate, endDate,db)=>{ // api calls
  let allDates = await _getDatesBetweenTwoDates(startDate, endDate,db);

  //extract year and month of b/w dates
  let yearMonth =[];

  for(let d of allDates){
      let m = d.getMonth()+1;
      let y = d.getFullYear();
      let check_key = `${y}_${m}`;
      if (!yearMonth.includes(check_key)) {
          let row ={};
          row.year=y;
          row.month=m;
          yearMonth[check_key] =row;
      }
  }
  // //--all holidays between dates
  let ALL_HOLIDAYS = [];
  let ALL_WEEKENDS = [];

  for(let[k,v] of Object.entries(yearMonth)) {
      let my_holidays = await getHolidaysOfMonth(v['year'],v['month'],db);
      let my_weekends = await getWeekendsOfMonth(v['year'], v['month'],db);

      ALL_HOLIDAYS = ALL_HOLIDAYS.concat(my_holidays);
      ALL_WEEKENDS = ALL_WEEKENDS.concat(my_weekends);
  }
  let finalDates = [];
  for(ad of allDates) {
      let row = {
          type:'working',
          sub_type: '',
          sub_sub_type : '',
          full_date :ad,
      }
      finalDates.push(row);
  }

  if (finalDates.length > 0 && ALL_WEEKENDS.length> 0) {
      for (let[key,ad] of finalDates) {
          for(let[k,aw] of Object.entries(ALL_WEEKENDS)) {
              if (ad['full_date'] == aw['full_date']) {
                  let row = {
                      type : 'non_working',
                      sub_type :'weekend',
                      sub_sub_type :'',
                      date : ad['full_date']
                  }
                  finalDates[key] = row;
                  break;
              }
          }
      }
  }
  if (finalDates.length > 0 && ALL_HOLIDAYS.length > 0) {
      for(let[key,ad] of Object.entries(finalDates)) {
          for(let[k,aw] of Object.entries(ALL_HOLIDAYS)) {
              if (ad['full_date'] == aw['full_date']) {
                let row = {
                  type : 'non_working',
                  sub_type : 'holiday',
                  sub_sub_type :aw['name'],
                  date : ad['full_date']
              }
                  finalDates[key] =row;
                  break;
              }
          }
      }
  }

  //-----------------
  let res_working_days = 0;
  let res_holidays = 0;
  let res_weekends = 0;
  for(let f of finalDates) {
      if (f['type'] == 'working') {
          res_working_days++;
      } else if (f['type'] == 'non_working') {
          if (f['sub_type'] == 'holiday') {
              res_holidays++;
          } else if (f['sub_type'] == 'weekend') {
              res_weekends++;
          }
      }
  }

  let r_data ={};
  r_data['start_date'] = startDate;
  r_data['end_date'] = endDate;
  r_data['working_days'] = res_working_days;
  r_data['holidays'] = res_holidays;
  r_data['weekends'] = res_weekends;
  r_data['days'] = finalDates;


 Return = {}
 Return['error'] = 0;
 r_data['message'] = '';
 Return['data'] = r_data;

  return Return;
};

let changeLeaveStatus=async(leaveid, newstatus, rejectedReason,db)=>{
  let q;
  if( rejectedReason != false ){
    q = await db.sequelize.query(`UPDATE leaves set status='${newstatus}', rejected_reason='${rejectedReason}' WHERE id = ${leaveid}`,{type:QueryTypes.UPDATE});    
} else {
    q =  await db.sequelize.query(`UPDATE leaves set status='${newstatus}' WHERE id = ${leaveid}`,{type:QueryTypes.UPDATE});
}
return true;
};

module.exports = {
  _getPreviousMonth,leaveDocRequest,
  getEmployeeLastPresentDay,API_deleteHoliday,addHoliday,getHolidayTypesList,API_getHolidayTypesList,API_getYearHolidays,
  cancelAppliedLeave,API_getMyRHLeaves,applyLeave,updateLeaveStatus
};
