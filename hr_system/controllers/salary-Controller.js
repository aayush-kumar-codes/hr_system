const db = require("../db");
const providers = require("../providers/creation-provider");
const reqValidate = require("../providers/error-check");
const jwt = require("jsonwebtoken");
const secret = require("../config");
const _=require("lodash")
const {deleteUserSalary,getUserManagePayslipBlockWise,getAllUserInfo,createUserPayslip}=require("../salaryFunctions")
exports.delete_salary=async(req,res,next)=>{
   try {
       let resp;
    let message,error;
    if(req.body.user_id && req.body.salary_id){
        let userid = req.body['user_id'];
        let salaryid =req.body['salary_id'];
        resp =await deleteUserSalary(userid,salaryid,db);
        message=resp.data;
        error=resp.error;
    }else{
        message="please provide userid and salary id "
        error=1;
    }
    res.status_code=200;
    res.data=message;
    res.error=resp.error
    return next();
}catch(error){
    console.log(error)
    res.status_code=500;
    res.message=error.message;
    return next();
}
};

exports.get_user_manage_payslips_data=async(req,res,next)=>{
    try {
        let resp={};
        let year;
        if (req.body['user_id'] && req.body['user_id'] != "") {

            let loggedUserRole = "";
            let loggedUserInfo=req.userData;
            if( loggedUserInfo != false ){
                loggedUserRole = loggedUserInfo['role'];
            }
            if( loggedUserRole.toLowerCase() == 'hr' ){
                resp['error'] = 0;
                r_data ={}
                r_data['all_users_latest_payslip'] ={}
                resp['data'] = r_data;
            }else{
                let extra_arrear = "";
                let arrear_for_month = "";
                let userid = req.body['user_id'];
                if (req.body['year']) {
                    year = req.body['year'];
                }
                if (req.body['month']) {
                    month = req.body['month'];
                }
                if ((req.body['extra_arrear']) && (req.body['arrear_for_month'])) {
                   extra_arrear = req.body['extra_arrear'];
                   arrear_for_month = req.body['arrear_for_month'];
                }
                if ((!req.body['year']) && !(req.body['month']))  {
                    let currentYear = new Date().getFullYear();
                    let currentMonth = new Date().toLocaleString('default', { month: 'long' })
                    if (currentMonth == "January") {
                        let date1=new Date();
                        year=(new Date(date1).getFullYear())-1;
                        month=(new Date(date1).getMonth())
                    } else {
                        year = currentYear;
                        month = (new Date().getMonth())
                    }
                }
                // $res = Salary::getUserManagePayslip($userid, $year, $month, $extra_arrear, $arrear_for_month);
                resp = await getUserManagePayslipBlockWise(userid, year, month, extra_arrear, arrear_for_month,db,req);
 
                /* this is added to notify employee about missing timings for days */

            }

        }
     res.status_code=200;
     res.data=resp.data;
     res.message=resp.message;
     res.error=resp.error
     return next();
    }catch(error){
     console.log(error)
     res.status_code=500;
     res.message=error.message;
     return next();
    }
 };

 exports.get_user_salary_info_by_id=async(req,res,next)=>{
     try {

        res.status_code=200;
        res.data=resp.data;
        res.message=resp.message;
        res.error=resp.error
        return next();
     } catch (error) {
        console.log(error)
        res.status_code=500;
        res.message=error.message;
        return next();  
     }
 }
 exports.create_employee_salary_slip=async(req,res,next)=>{
    try {
        let resp={};
        if ((req.body['user_id']) && req.body['user_id'] != "") {
            resp = await createUserPayslip(req,db);
        } else {
            resp['message'] = 'Please give user_id ';
        }
       res.status_code=200;
       res.data=resp.data;
       res.message=resp.message;
       res.error=resp.error
       return next();
    } catch (error) {
       console.log(error)
       res.status_code=500;
       res.message=error.message;
       return next();  
    }
};
exports.get_all_users_detail=async(req,res,next)=>{
    try {
        let hideSecureInfo = true;
        let loggedUserInfo=req.userData
        if((loggedUserInfo['role']) && (loggedUserInfo['role'].toLowerCase) == 'admin' ){
        hideSecureInfo = false;
        }
        let resp = await getAllUserInfo(false, hideSecureInfo,req,db);
        res.status_code=200;
        res.data=resp.data;
        res.message=resp.message;
        res.error=resp.error
       return next();
    } catch (error) {
       console.log(error)
       res.status_code=500;
       res.message=error.message;
       return next();  
    }
}
