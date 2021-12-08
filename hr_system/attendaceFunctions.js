const md5=require("md5")
const jwt = require("jsonwebtoken");
const secret = require("./config.json");
const {Op,QueryTypes, json } = require("sequelize");
const db = require("./db");
const { sequelize } = require("./db");
const{_getDatesBetweenTwoDates,_getNextMonth,_getPreviousMonth,_getCurrentMonth,getGenericMonthSummary}=require('./leavesFunctions')
// const{getUserMonthAttendace}=require("./leavesFunctions")

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
    let insert = await insertUserWorkingHours(userid, date, working_hours, reason);
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
module.exports={
   getAllUserPrevMonthTime,updateDayWorkingHours,
   multipleAddUserWorkingHours,getWorkingHoursSummary
}