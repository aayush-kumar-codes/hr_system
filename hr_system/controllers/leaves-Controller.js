const db = require("../db");
const providers = require("../providers/creation-provider");
const reqValidate = require("../providers/error-check");
const jwt = require("jsonwebtoken");
const secret = require("../config");
const{_getPreviousMonth,getEmployeeLastPresentDay,API_deleteHoliday,addHoliday,API_getHolidayTypesList,API_getYearHolidays,cancelAppliedLeave,applyLeave
    ,API_getMyRHLeaves,leaveDocRequest,updateLeaveStatus}=require("../leavesFunctions")

exports.adminUserApplyLeave=async(req,res,next)=>{
    try{
    let from_date = to_date = no_of_days = reason = day_status = '';   
    let leave_type = late_reason = "";
    let doc_link = "N/A";
    let rh_dates = false;
    let res1;
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
    //     res1 = await applyLeave(userid, from_date, to_date, no_of_days, reason, day_status, leave_type = "", late_reason = "", req.body['pending_id'], doc_link, rh_dates);
    // }else{
    //     res1 = await applyLeave(userid, from_date, to_date, no_of_days, reason, day_status, leave_type, late_reason, "", doc_link, rh_dates);
    // }
    res.status_code=200;
    res.message=res1
    return next;
 }catch(error){
    console.log(error)
}
}


exports.delete_holiday=async(req,res,next)=>{
    try{
    let id =req.body['holiday_id'];
    let resp = await API_deleteHoliday(id,db);
    res.status_code=200;
    res.error=resp.error;
    res.message=resp.data;
    return next();
} catch (error) {
  res.status_code = 500;
  res.message = error.message;
  return next();
}

}
exports.add_holiday=async(req,res,next)=>{
    try{
        let date = req.body['holiday_date'];
        let name = req.body['holiday_name'];
        let type = req.body['holiday_type'];
        let resp = await addHoliday(name, date, type,db);
        res.status_code = 200;
        res.message=resp.data;
        res.error=resp.error
        return next();
    } catch (error) {
      res.status_code = 500;
      res.message = error.message;
      return next();
    }
}
exports.get_holiday_types_list=async(req,res,next)=>{
    try{
    resp=await API_getHolidayTypesList(db)
    res.status_code = 200;
    res.message=resp.data;
    res.error=resp.error
    return next();
} catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
}
exports.get_holidays_list=async(req,res,next)=>{
    try{
    let year = req.body['year'];
    let resp = await API_getYearHolidays(year,db);
    res.status_code = 200;
    res.message=resp.data.message;
    res.data=resp.data.holidays;
    res.error=resp.error
    return next();
} catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
}
exports.cancel_applied_leave=async(req,res,next)=>{
    try{
        let resp={};
        if ((req.body['user_id']) && req.body['user_id'] != "") {
            resp = await cancelAppliedLeave(req,db);
        } else {
            resp.data={};
            resp['data']['message'] = 'Please give user_id ';
        }  
        res.status_code =200;
        res.data=resp;
        return next();
    } catch (error) {
        res.status_code = 500;
        res.message = error.message;
        return next();
      }
}
exports.get_my_rh_leaves=async(req,res,next)=>{
    try{
        let year=req.body.year;
        let userid=req.body.user_id;
        let resp = await API_getMyRHLeaves( userid, year,db );
        res.status_code =200;
        res.data=resp.data;
        res.error=resp.error;
        return next();
    } catch (error) {
        res.status_code = 500;
        res.message = error.message;
        return next();
      }
}

exports.send_request_for_doc=async(req,res,next)=>{
    try{
    let leaveid = req.body['leaveid'];
    let doc_request = req.body['doc_request'];
    let comment = req.body['comment'];
    let resp = await leaveDocRequest(leaveid, doc_request, comment,db);
    res.status_code=200;
    res.data=resp;
    return next()
    }catch(error){
        console.log(error);
        res.status_code = 500;
        res.message = error.message;
        return next();
    }
}
exports.change_leave_status=async(req,res,next)=>{
    try{
        let leaveid = req.body['leaveid'];
        let newstatus = req.body['newstatus'];
        let messagetouser = req.body['messagetouser'];
        let resp = await updateLeaveStatus(leaveid, newstatus, messagetouser,db);
    }catch(error){
  console.log(error)
    }
}