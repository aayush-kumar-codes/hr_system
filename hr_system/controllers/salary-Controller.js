const db = require("../db");
const providers = require("../providers/creation-provider");
const reqValidate = require("../providers/error-check");
const jwt = require("jsonwebtoken");
const secret = require("../config");
const _=require("lodash")
const {deleteUserSalary}=require("../salaryFunctions")
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
}