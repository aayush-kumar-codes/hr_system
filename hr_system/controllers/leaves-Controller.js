const db = require("../db");
const providers = require("../providers/creation-provider");
const reqValidate = require("../providers/error-check");
const jwt = require("jsonwebtoken");
const secret = require("../config");
const{_getPreviousMonth,getEmployeeLastPresentDay}=require("../leavesFunctions")

exports.adminUserApplyLeave=async(req,res,next)=>{
    let from_date = to_date = no_of_days = reason = day_status = '';   
    let leave_type = late_reason = "";
    let doc_link = "N/A";
    let rh_dates = false;
    let res1;
    // console.log(from_date,to_date,leave_type,doc_link,rh_dates)
    let userid = req.body['user_id'];
    if(req.body['from_date'] ){
        from_date = req.body['from_date'];    
    }
    if( req.body['to_date'] ){
        to_date =req.body['to_date'];    
    }
    if(req.body['no_of_days'] ){
        no_of_days = req.body['no_of_days'];    
    }
    if(req.body['reason'] ){
        reason = req.body['reason'];    
    }
    if(req.body['day_status'] ){
        day_status = req.body['day_status'];    
    }    
    if(req.body['doc_link'] && req.body['doc_link'] != "" ){
        doc_link = req.body['doc_link'];
    }
    if(req.body['reason'] ){
        leave_type = req.body['leave_type'];    
    }
    if(req.body['reason'] ){
        late_reason = req.body['late_reason'];    
    }    
    if(req.body['rh_dates'] ){
        rh_dates = req.body['rh_dates'];    
    } 

    // if (req.body['pending_id']) {
        let date = new Date()
        let currentDateDate = date.getDate();
        let currentMonth = date.getMonth()+1;
        let currentYear = date.getFullYear();
        let currentDate = `${currentYear}.${currentMonth}.${currentDateDate}.`;

        let previousMonth = await _getPreviousMonth(currentDate);
        reason = 'Previous month pending time is applied as leave!!';

        // if( from_date == '' ){
            let employeeLastPresentDay = await getEmployeeLastPresentDay( userid, previousMonth.year, previousMonth.month,db);
            from_date =  employeeLastPresentDay['full_date'];
            to_date = employeeLastPresentDay['full_date'];
        // }
        // res1 = await applyLeave(userid, from_date, to_date, no_of_days, reason, day_status, leave_type = "", late_reason = "", req.body['pending_id'], doc_link, rh_dates);
    // }else{
        // res1 = await applyLeave(userid, from_date, to_date, no_of_days, reason, day_status, leave_type, late_reason, "", doc_link, rh_dates);
    // }
}