const md5=require("md5")
const jwt = require("jsonwebtoken");
const secret = require("./config.json");
const {Op,QueryTypes, json } = require("sequelize");
const db = require("./db");
const { sequelize } = require("./db");
    let getUserMonthAttendaceComplete=async(userid, year, month,db)=>{
     let r_error = 1;
     let r_message = "";
     let r_data = {};

     let userMonthAttendance = await getUserMonthAttendace(userid, year, month,db);
     let monthSummary = await _beautyMonthSummary(userMonthAttendance,db);

     let beautyMonthAttendance = await _beautyMonthAttendance(userMonthAttendance,db);

        let nextMonth = await _getNextMonth(year, month);
        let previousMonth = await _getPreviousMonth(year, month);
        let currentMonth = await _getCurrentMonth(year, month);

        //----user details -----
        let userDetails = await getUserInfo(userid);
        dateofjoining = userDetails['dateofjoining'];
        destroy(userDetails['password']);

        ///////////
        // r_data['userProfileImage'] = await _getEmployeeProfilePhoto(userDetails);
        r_data['userName'] = userDetails['name'];
        r_data['userjobtitle'] = userDetails['jobtitle'];
        r_data['userid'] = userid;
        r_data['year'] = year;
        r_data['month'] = month;
        r_data['monthName'] = currentMonth['monthName'];
        r_data['monthSummary'] = monthSummary;
        r_data['nextMonth'] = nextMonth;
        r_data['previousMonth'] = previousMonth;

        /* add check if date is before joining date */
        if( dateofjoining && beautyMonthAttendance.length > 0 ){
            for(let [key,value] of beautyMonthAttendance) {
                beautyMonthAttendance[key]['isDayBeforeJoining'] = false;
                if( strtotime(dateofjoining) > strtotime(value['full_date']) ){
                    beautyMonthAttendance[key]['isDayBeforeJoining'] = true;
                }
            }
        }
        /* add check if date is before joining date */

        r_data['attendance'] = beautyMonthAttendance;


        // added to calculate compensation times added by arun on 29th jan 2018
        let analyseCompensationTime = await_analyseCompensationTime($beautyMonthAttendance);
        r_data['compensationSummary'] = analyseCompensationTime;

        r_error = 0;
        let Return = {};
        Return.error = r_error;
        Return.r_data['message'] = r_message;
        Return['data'] = r_data;        

        return Return;
    }

module.exports={
    getUserMonthAttendaceComplete
}