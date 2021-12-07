const { QueryTypes } = require("sequelize");
const md5=require("md5")

let deleteUserSalary=async(userid,salaryid,db)=>{
    let r_error = 1;
    let r_message = "";
    let r_data ={}
    let q = await db.sequelize.query(`DELETE FROM salary WHERE id = '${salaryid}'`,{type:QueryTypes.DELETE});
    let q2 = await db.sequelize.query(`DELETE FROM salary_details WHERE salary_id = '${salaryid}'`,{type:QueryTypes.DELETE});
    r_error = 0;
    r_message = "Salary deleted successfully";
    r_data['message'] = r_message;
    let Return = {}
    Return['error'] = r_error;
    Return['data'] = r_data;
    return Return;
}  

module.exports={
    deleteUserSalary
}