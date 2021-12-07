const md5=require("md5")
const jwt = require("jsonwebtoken");
const secret = require("./config.json");
const {Op,QueryTypes, json } = require("sequelize");
const db = require("./db");
const { sequelize } = require("./db");
const{_getNextMonth,_getPreviousMonth,_getCurrentMonth}=require('./leavesFunctions')
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
module.exports={
   getAllUserPrevMonthTime
}