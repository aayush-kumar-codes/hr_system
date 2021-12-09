const md5=require("md5")
const moment =require("moment")
const jwt = require("jsonwebtoken");
const secret = require("./config.json");
const {Op,QueryTypes, json } = require("sequelize");
const db = require("./db");
const { sequelize } = require("./db");
const{_}=require("lodash")
const{_getDatesBetweenTwoDates,_getNextMonth,_getPreviousMonth,
    _getCurrentMonth,getGenericMonthSummary,
    getUserMonthAttendace,getUserDaySummary}=require('./leavesFunctions')

const getAllUserPrevMonthTime=async(year,month,db)=>{
    let r_error = 1;
    let r_message = "";
    let r_data ={};
    let format_array =[];
    let yearMonthForQuery=year+ "-" + month;
    let rows =await db.sequelize.query(`Select users.status,user_profile.name,users_previous_month_time.* from users Inner Join user_profile on users.id = user_profile.user_Id Inner Join users_previous_month_time on users.id = users_previous_month_time.user_Id where users_previous_month_time.year_and_month ='${yearMonthForQuery}' AND users.status='Enabled'`,{type:QueryTypes.SELECT});
    if(rows.length > 0){
        for(let val of rows){
           let hr_min = "";
           hr_min =(val['extra_time']).split(":")
           val['pending_hour'] =hr_min[0];
           val['pending_minute'] =hr_min[1];
           date =year+"-"+month+"-01";
           time_detail = await userCompensateTimedetail(val['user_Id'],date);
           val['time_detail'] =time_detail;
           format_array.push(val);
        }
    }
    let nextMonth = await _getNextMonth(year, month,db);
    let previousMonth = await _getPreviousMonth(year, month,db);
    let currentMonth = await _getCurrentMonth(year, month,db);

   r_data['nextMonth'] =nextMonth;
   r_data['previousMonth'] =previousMonth;
   r_data['month'] =month;
   r_data['monthName'] =currentMonth['monthName'];
   r_data['year'] =year;
   r_data['user_list'] =format_array;

    if (rows.length > 0) {
        r_error = 0;
        r_message = "Data found";
    } else {
        r_error = 1;
        r_message = "No Data found";
    }
    let Return = {};
    Return['error'] = r_error;
    Return['data'] = r_data;
    Return['message'] = r_message;
    return Return;

}

let updateDayWorkingHours=async(date,time,db)=>{
    // let r_error=1;
    let q =await db.sequelize.query(`SELECT * FROM working_hours WHERE date='${date}'`,{type:QueryTypes.SELECT});
    let message = "";
   console.log(q.length)
    if (Array.isArray(q)&& q.length > 0) {
        console.log(11111)
        q = await db.sequelize.query(`UPDATE working_hours set working_hours='${time}' WHERE date = '${date}'`,{type:QueryTypes.UPDATE});
        console.log(1)
        message = "Success Update";
        console.log(12112)
    } else {
        q = await db.sequelize.query(`INSERT into working_hours ( working_hours, date  ) VALUES ( '${time}', '${date}' )`,{type:QueryTypes.INSERT});
        console.log(q,1212)
        message = "Success Insert";
    }
    let monthYear = {
        'month' :new Date(date).getMonth()+1,
        'year' :new Date(date).getFullYear(),
    }
    r_error = 0;
    Return = {};
    let r_data = {};
    Return['error'] = r_error;
    r_data['message'] = message;
    r_data['monthYear'] = monthYear;
    Return['data'] = r_data;
    return Return;

}
let multipleAddUserWorkingHours=async(req,db)=>{
    let r_error = 0;
    let r_message = "";
    let r_data = {};
    let logged_user_id=req.userData.id;
    let date_start = "";
    let date_end = "";
    let week_day = "";
    let week_of_month = "";
    let userid = "";
    let day_type = ""; // working OR non-working
    let working_hours = "";
    let reason = "";
    if( req.body.day_type != 'working' ){
        working_hours = "00:00";
    } if( req.body.date_start == "" || req.body.date_end == "" ){
        r_error = 1;
        r_message = "Start or end date is missing";
    } else if( req.body.week_day == "" || req.body.week_of_month == "" ){
        r_error = 1;
        r_message = "Week day or week of month is missing";
    } else if( req.body.day_type == ""){
        r_error = 1;
        r_message = "Day type is missing";
    }else {

        let dates = await _getDatesBetweenTwoDates(date_start,date_end);
        let monthsYear = [];
        for(let [key,value] of dates) {
            let p_year =  new Date(value).getFullYear();
            let p_month =  new Date(value).getMonth()+1;
            let p_year_month = p_year+"-"+p_month;
            if( !_.isSet(monthsYear[p_year_month]) ){
                monthsYear[p_year_month] ={
                    "year" : p_year,
                    "month" : p_month,
                }
            }
        }
        let daysToConsiderFinalArray = [];

        let logsText = "";
        if( monthsYear.length > 0 ){
            for(let [key,ym] of monthsYear) {
                let monthDays =await getGenericMonthSummary( ym['year'], ym['month'] );
                let check_week_of_month = 0;
                for(let [key,md] of monthDays) {
                    if((md['day']).toLowerCase()== (req.body.week_day).toLowerCase()){
                        check_week_of_month++;
                        if(new Date (md['full_date']).getTime() >= new Date(date_start).getTime() && new Date(md['full_date']).getTime() <= new Date(date_end).getTime() ){
                            if( check_week_of_month == week_of_month ){
                                daysToConsiderFinalArray.push(md);
                            }
                        }
                    }
                }                
            }
        } 
        if(daysToConsiderFinalArray.length > 0 ){   
            for(let [key,d] of Object.entries(daysToConsiderFinalArray)){
                let date = d['full_date'];
                await addUserWorkingHours(req.body.userid, date, req.body.working_hours,req.body.reason,db);
                if( logsText == "" ){
                    logsText += date;
                } else {
                    logsText += ', '+date;
                }
                
            }
            r_message = "Working hours added";
        }else {
            r_message = "No matching dates found for opted criteria";
            logsText = r_message;
        }
        let q =await db.sequelize.query(`INSERT INTO user_working_hours_multiadd_logs
        (userid, week_day, week_of_month, day_type, working_hours, date_start, date_end, reason, updated_by, logs)
        VALUES
        ('${req.body.userid}', '${req.body.week_day}', '${req.body.week_of_month}', '${req.body.day_type}', '${req.body.working_hours}', '${req.body.date_start}', '${req.body.date_end}', '${req.body.reason}', ${logged_user_id} , '${logsText}' )`,
        {type:QueryTypes.INSERT});
    }
    r_error = 0;
    let Return = {};
    Return['error'] = r_error;
    Return['message'] = r_message;
    Return['data'] = r_data;    
    return Return;
}
let addUserWorkingHours=async(userid, date,working_hours,reason,db,pending_id = false)=>{
    let insert = await insertUserWorkingHours(userid, date, working_hours, reason,db);
    console.log(8888888)
    // let beautyDate = date('d-M-Y', strtotime($date));
    // /* send notification to user and hr*/
    // let messageBody = {
    //     "date": beautyDate,
    //     "time": working_hours,
    //     "reason": reason
    // }
    // $slackMessageStatus = self::sendNotification( "update_employee_working_hours", $userid, $messageBody);
    
    if (pending_id != false) {
        let row = await db.sequelize.query(`Select * from users_previous_month_time where id = '${pending_id}'`,{type:QueryTypes.SELECT});
        let oldStatus = row['status'];
        let q =await db.sequelize.query(`UPDATE users_previous_month_time SET status = '${oldStatus} - Time added to user working hours', status_merged = 1  Where id = '${pending_id}'`,{type:QueryTypes.UPDATE});
    }
    let r_data = {};
        let Return = {};
        Return['error'] = 0;
        r_data['message'] = 'Successfully added';
        Return['data'] = r_data;

        return Return;
}
let insertUserWorkingHours=async(userid, date, working_hours, reason,db)=>{
    let q =await db.sequelize.query(`INSERT INTO user_working_hours ( user_Id, date, working_hours, reason ) VALUES ( '${userid}', '${date}', '${working_hours}', '${reason}')`,{type:QueryTypes.INSERT});
    return true;
}
let getWorkingHoursSummary=async(year,month,db)=>{
    let r_data={};
    let workingHoursSummary = await getGenericMonthSummary(year,month,userid=false,db);
    let aa = [];
    for (let p of workingHoursSummary ) {
        aa.push(p);
    }

    let nextMonth = await _getNextMonth(year, month);
    let previousMonth = await _getPreviousMonth(year, month);
    let currentMonth = await _getCurrentMonth(year, month);
    r_data['year'] = year;
    r_data['month'] = month;
    r_data['monthName'] = currentMonth['monthName'];
    // r_data['monthSummary'] = monthSummary;
    r_data['nextMonth'] = nextMonth;
    r_data['previousMonth'] = previousMonth;
    r_data['monthSummary'] = aa;

    r_error = 0;
    let Return = {};
    Return['error'] = r_error;
    r_data['message'] = '';
    Return['data'] = r_data;

    return Return;
}
let getEmployeeCurrentMonthFirstWorkingDate=async(userid,db)=>{
    let Return = false;
   let currentDate = new Date();
   let currentYear = new Date().getFullYear();
   let currentMonth = new Date().getMonth()+1;
   let currentDateDate =new Date().getDate();

    let monthDetails = await getUserMonthAttendace(userid, currentYear, currentMonth,db);
    
    let tempArray = [];
    for( let md of monthDetails){
        md_date = md['date'];
        if( md['day_type'] == 'WORKING_DAY' ){
            tempArray.push(md);
        }
    }
    Return = tempArray[0];
    return Return;
};

let geManagedUserWorkingHours=async(userid,db)=>{ // api call
    let allWorkingHours = await getUserMangedHours1(userid,db);

    let finalData = {};
    if (Array.isArray(allWorkingHours) && allWorkingHours.length > 0) {
        finalData = allWorkingHours;
    }

    let Return = {};
    Return['error'] = 0;
    r_data = {};
    r_data['message'] = '';
    r_data['list'] = finalData;
    userInfo = await getUserInfo1(userid,db);
    delete(userInfo['password']);
    r_data['userInfo'] = userInfo;
    Return['data'] = r_data;

    return Return;
}
let getUserMangedHours1 = async (userid, db) => {
    let rows =
      (`SELECT * FROM user_working_hours WHERE user_Id = userid order by id DESC`,
        { type: QueryTypes.SELECT });
    return rows;
  };
  let getUserInfo1 = async (userid, models) => {
    try {
      let isAdmin;
      let q = await models.sequelize.query(`SELECT users.*, user_profile.*, 
      roles.id as role_id, 
      roles.name as role_name FROM users 
      LEFT JOIN user_profile ON users.id = user_profile.user_Id 
      LEFT JOIN user_roles ON users.id = user_roles.user_id 
      LEFT JOIN roles ON user_roles.role_id = roles.id where users.id = ${userid} `,{type: QueryTypes.SELECT});
      if(isAdmin == null){
        delete q.holding_comments;
      }
      // let userSlackInfo = await getSlackUserInfo(q.work_email);
      // q.slack_profile = userSlackInfo;
      return q;
    } catch (error) {
      console.log(error)
      throw new Error(error);
    }
  };
  let insertUserInOutTimeOfDay=async(userid, date, inTime, outTime,reason,db,req)=>{
     let extra_time = 0;
    let newdate =new Date(date);
    let isadmin;
    if(req.userData.role.toLowerCase()=="admin"){
        isadmin=true;
    }else{
        isadmin=false;
    }
    if (isadmin == false) {
        let q =await db.sequelize.query(`select * from config where type='extra_time'`,{type:QueryTypes.SELECT});
        if (q.length > 0) {
            extra_time =row['value'];
        }
        let row2 =await db.sequelize.query(`select * from hr_data where user_id= '${userid}' AND date = '${newdate}'`,{type:QueryTypes.SELECT});
        if (row2.length> 0) {
            if (_.isEmpty(row2['entry_time'])) {
                let timeStamp=await timetostamp(inTime,date);
                timestamp=timestamp+(extra_time * 60)
                let inTimeDate =new Date(timeStamp);
                inTime=await getCurrentTime(inTimeDate)
            }
            if (_.Empty(row2['exit_time'])) {
                let timeStamp=await timetostamp(outTime,date)
                timeStamp=timeStamp-(extra_time * 60)
                let outTimeDate =new Date(timeStamp);
                outTime=await getCurrentTime(outTimeDate)
            }
        } else {
            let timeStamp=await timetostamp(outTime,date);
            timeStamp=timeStamp-(extra_time * 60);
            let outTimeDate =new Date(timeStamp);
            outTime=await getCurrentTime(outTimeDate)
        }
    }
     //start -- first get existing time details
     let previous_entry_time = "";
     let previous_exit_time = "";
     let existingDetails =await getUserDaySummary(userid, date,db);
     if (_.isSet(existingDetails['data'])) {
         previous_entry_time = existingDetails['data']['entry_time'];
         previous_exit_time = existingDetails['data']['exit_time'];
     }
     let r_error = 1;
     let r_message = "";
     let r_data ={};
     if (inTime != '') {
        let inTime1 = date + ' ' +inTime;
        let insertInTime = inTime1;
        await insertUserPunchTime(userid,insertInTime,db);
    }
    if (outTime != '') {
        let outTime1 = date + ' ' +outTime;
        let insertOutTime =outTime1
        await insertUserPunchTime(userid, insertOutTime);
    }
    if (inTime != '' && outTime != '') {
        let h_date =new Date(date)
        await insertUpdateHr_data(userid, h_date, inTime, outTime,db);
        let punchInTimeMessage = "";
        let punchOutTimeMessage = "";
        if (previous_entry_time != '' && previous_entry_time != inTime) {
            punchInTimeMessage = `Entry Time - From ${previous_entry_time} to ${inTime}`;
        } else {
            punchInTimeMessage = `Entry Time - ${inTime}`
        }
        if (previous_exit_time != '' && previous_exit_time != outTime) {
            punchOutTimeMessage = `Exit Time - From ${previous_exit_time} to ${outTime}`;
        } else {
            punchOutTimeMessage = `Exit Time - ${outTime} `;
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
        let Return = {};
        Return['error'] = r_error;
        r_data['message'] = r_message;
        Return['data'] = r_data;

        return Return;
  };

  let insertUpdateHr_data=async(userid, date, entry_time, exit_time,db)=> {
    date=JSON.parse(JSON.stringify(date))
    date=date.slice(0,10)
    //d-m-Y
    let q =await db.sequelize.query(`SELECT * FROM hr_data WHERE user_id = '${userid}' AND date= '${date}'`,{type:QueryTypes.SELECT});

    if (q.length > 0) {
        //update
        q = await db.sequelize.query(`UPDATE hr_data set entry_time='${entry_time}', exit_time='${exit_time}' WHERE user_id = '${userid}' AND date = '${date}'`,{type:QueryTypes.UPDATE});
    } else {
        //insert
        let userInfo = await getUserInfo1(userid,db);
        let emailid = userInfo[0]['work_email'];
        q = await db.sequelize.query(`INSERT into hr_data ( user_id, email, entry_time, exit_time, date  ) VALUES ( '${userid}', '${emailid}', '${entry_time}', '${exit_time}', '${date}' )`,{type:QueryTypes.INSERT});
    }
    return true;
}

  let insertUserPunchTime=async(user_id,timing)=>{
    //   console.log(timing.sp)
    // $q = "INSERT into attendance ( user_id, timing ) VALUES ( $user_id, '$timing')";
    // self::DBrunQuery($q);
    // return true;
    let q =await db.sequelize.query(`SELECT * FROM attendance WHERE user_id = '${user_id}' AND timing = '${timing}'`,{type:QueryTypes.SELECT});
    if( q.length < 1 ){
        q = await db.sequelize.query(`INSERT into attendance ( user_id, timing ) VALUES ('${user_id}', '${timing}')`,{type:QueryTypes.INSERT});
    }
    return true;
}

  let getCurrentTime=async(date)=>{
    var currentTime;
    // here we can give our date
    var currentDate = new Date(date);
    // OR we can define like that also for current date
    // var currentDate = new Date();
    var hour = currentDate.getHours();
    var meridiem = hour >= 12 ? "PM" : "AM";
    currentTime = ((hour + 11) % 12 + 1) + ":" + currentDate.getMinutes() + meridiem;
    return currentTime;
}
  let timetostamp=async(time,date=false)=>{
      let hr=time.split(":")[0];
      let min=time.split(":")[1];
      min=min.split("A")[0];
      let meridean=time.split(":")[1];
      meridean=meridean.slice(2,4);
    if(date==false){
        date=new Date();
        date=JSON.parse(JSON.stringify(date)).slice(0,10);
    }
    if(meridean.toLowerCase()=="am"){
    }else{
        hr=hr+12;
    }
    let dateToParse=date+" "+hr+":"+min+":"+00;
    dateToParse=(dateToParse).toString()
    let timestamp=Date.parse(dateToParse);
    return timestamp;
  }
  let addManualAttendance=async(user_id, time_type, date, manual_time, reason,db)=>{
   let last_inserted_ids = {};
   let dateTime = [];
   let Return = {};
   Return_msg=[]
   let bodyActionButtons = {};
   let exist = 0;
   let hours = "";
   entry_time=(new Date(date+" "+manual_time['entry_time']));
   exit_time = (new Date(date+" "+manual_time['exit_time']));
   let timediff={};
   timediff.h=(moment(exit_time).hours()-moment(entry_time).hours());
   timediff.i=(moment(exit_time).minutes()-moment(entry_time).minutes());       
    timediff.h > 0 ? hours = timediff.h : hours  = false;
    timediff.i > 0 ? hours =hours+":"+ timediff.i : minutes= false;
    for(let [key,time] of Object.entries(manual_time)){
        explodeTime =time.split(" ")
        time=time.split(" ")[0]+time.split(" ")[1]
        checkTime = date+' '+time;
        checkIfTimingExits = await checkTimingExitsInAttendance( user_id, checkTime,db);
        let final_date_time = date +' '+time;
        let timeType =  key.split("_");
        if( checkIfTimingExits == false ){
            let reason_new =reason;
            let q =await db.sequelize.query(`INSERT into attendance_manual ( user_id, manual_time, reason ) VALUES ( '${user_id}', '${final_date_time}', '${reason_new}')`,{type:QueryTypes.INSERT});
            last_inserted_id =q[0];     
            let timeType  =key.replace("_","")
            let dateTime1=(timeType+":"+final_date_time);
            let firstLetterLowerCase=dateTime1[0]
            let firstLetterUpperCase=dateTime1[0].toUpperCase();
            dateTime1=(dateTime1.replace(firstLetterLowerCase,firstLetterUpperCase))
            dateTime.push(dateTime1);
            Return_msg.push(timeType+`${final_date_time} - Sent For Approval!!`);     
        }else {
            timeType=timeType[0]+timeType[1];
            exist++;
            let dateTime1=timeType+":"+final_date_time+" which is already exist";
            let firstLetterLowerCase=dateTime1[0]
            let firstLetterUpperCase=dateTime1[0].toUpperCase();
            dateTime1=dateTime1.replace(firstLetterLowerCase,firstLetterUpperCase) 
            dateTime.push(dateTime1)            
            Return_msg = (timeType + ` ${checkTime} already exists. No Need to update!!`);
        } 
    }
    let date_time=dateTime.join(" and ")
    if( exist == 0 ){
        Return = `${date_time} - Sent For Approval!!`;
    } else if( exist == (Object.entries(manual_time).length)) {
        Return = `${date_time} . No Need to update!!`;
    } else {
        Return =Return_msg.join(" and ")
    }

        // /* send message to employee */
        // $hours ? $date_time .= " \n *$hours* to be requested." : false;
        // $messageBody = array(
        //     "timeType" => $time_type,
        //     "reason" => $reason,
        //     "dateTime" => $date_time
        // );
        // $slackMessageStatus = self::sendNotification( "add_manual_punch_timings", $user_id, $messageBody);

        // /* send message to admin/hr for approval*/
        // $baseURL =  $_ENV['ENV_BASE_URL'];
        // $last_inserted_ids = join(',', $last_inserted_id);
        // $approveLink = $baseURL."attendance/API_HR/api.php?action=approve_manual_attendance&id=$last_inserted_ids";
        // $approveLinkMinutesLess = $baseURL."attendance/API_HR/api.php?action=approve_manual_attendance&id=$last_inserted_ids&deductminutes=15";
        // $rejectLink = $baseURL."attendance/API_HR/api.php?action=reject_manual_attendance&id=$last_inserted_ids";            

        // $bodyActionButtons[] = array(
        //     "type" => "button",
        //     "text" => "Approve",
        //     "url" => $approveLink,
        //     "style" => "primary"
        // );
        // $bodyActionButtons[] = array(
        //     "type" => "button",
        //     "text" => "Reject",
        //     "url" => $rejectLink,
        //     "style" => "danger"
        // );
        // $bodyActionButtons[] = array(
        //     "type" => "button",
        //     "text" => "Approve With 15 Minutes Less",
        //     "url" => $approveLinkMinutesLess,
        //     "style" => "primary"
        // );  

        // $slackMessageStatus = self::sendNotification( "add_manual_punch_timings_admin", $user_id, $messageBody, $bodyActionButtons);

        return Return;
    
  };

  let  checkTimingExitsInAttendance=async( userid, timing,db )=>{
    let q =await db.sequelize.query(`SELECT * FROM attendance WHERE user_id = '${userid}' AND timing LIKE '%${timing}%'`,{type:QueryTypes.SELECT});
    if(q.length > 0 ){
        return true;
    }
    return false;
}
  
module.exports={
   getAllUserPrevMonthTime,updateDayWorkingHours,
   multipleAddUserWorkingHours,getWorkingHoursSummary,
   addUserWorkingHours,geManagedUserWorkingHours,
   getEmployeeCurrentMonthFirstWorkingDate,insertUserInOutTimeOfDay,addManualAttendance
}