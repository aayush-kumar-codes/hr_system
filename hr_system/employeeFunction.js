const {
    PAGE_login,
    PAGE_logout,
    PAGE_my_inventory,
    PAGE_policy_documents,
    getAllPages,
    getAllActions,
  } = require("./roles");
  
  const jwt = require("jsonwebtoken");
  const secret = require("./config.json");
  const {Op,QueryTypes, json } = require("sequelize");
  const db = require("./db");
  const { sequelize } = require("./db");
  const { MachineStatusDeleteValidator } = require("./validators/req-validators");
const { getUserInfo } = require("./allFunctions");

  
  let getUserDetailInfo = async (userid,req,models) => {
    try {
      let r_error = 1;
      let r_message = "";
      let r_data = {};
      user_bank_detail = await getUserBankDetail(userid,req,models);
      user_profile_detail =await getUserprofileDetail(userid,req,models);
      user_assign_machine = await getUserAssignMachines(userid,req,models);
      Return={};
      r_error=0;
      Return.error=r_error;
      Return.data={};
      Return.data.user_profile_detail=user_profile_detail ;
      Return.data.user_bank_detail=user_bank_detail;
      Return.data.user_assign_machine=user_assign_machine;
      return Return;
    } catch (error) {
       console.log(error)
    }
  };

  let getUserBankDetail= async (userid,req,models)=>{
  let query=await models.sequelize.query(`SELECT * FROM user_bank_details WHERE "user_Id" = ${userid}`,{type:QueryTypes.SELECT});
   let arr="";
   arr=query;
   return arr;
  }
  let getUserprofileDetail = async (userid,req,models)=>{
    let isAdmin="";
      let query=await models.sequelize.query(`SELECT users.status, users.username,
       users.type, user_profile.* FROM users 
      LEFT JOIN user_profile ON users.id = user_profile."user_Id" where users.status = 'Enabled' AND 
      users.id = ${userid}`,{type:QueryTypes.SELECT})
      if(isAdmin===""){
      delete query[0].holding_comments;
      }
       // addition on 21st june 2018 by arun to return profile image also. i.e slack image
      //  $slack_image = "";
      //  $allSlackUsers = self::getSlackUsersList();
      //  foreach ($allSlackUsers as $s) {
      //      if ($s['profile']['email'] == $row['work_email']) {
      //          $sl = $s;
      //          break;
      //      }
      //  }
      //  if (!isset($sl) || is_null($sl) ) {
      //      $row['slack_profile'] = $sl; 
      //  }
      //  $row['profileImage'] = HR::_getEmployeeProfilePhoto($row);
      let arr="";
      arr = query;
      return arr;

  }
  let  getUserAssignMachines=async(userid,req,models)=>{
    let query=await models.sequelize.query(`select machinelist.id, machinelist.machine_type,machinelist.machine_name,machinelist.mac_address,machinelist.serial_number, machinelist.bill_number, machines_user."user_Id",machines_user.assign_date from machinelist 
    left join machines_user on machinelist.id = machines_user.machine_id where machines_user."user_Id" = ${userid}`,{type:QueryTypes.SELECT})
    return query;
  }
  let getEnabledEmployeesBriefDetails= async(req,models)=>{
    let users=await getEnabledUsersListWithoutPass(req,models);
    return users;
  }
let getEnabledUsersListWithoutPass=async(req,models,role=false,sorted_by=false)=>{
let row=await getEnabledUsersList(req,models,sorted_by);
let secureKeys = [ 'bank_account_num', 'blood_group', 'address1', 'address2', 'emergency_ph1', 'emergency_ph2', 'medical_condition', 'dob', 'marital_status', 'city', 'state', 'zip_postal', 'country', 'home_ph', 'mobile_ph', 'work_email', 'other_email', 'special_instructions', 'pan_card_num', 'permanent_address', 'current_address', 'slack_id', 'policy_document', 'training_completion_date', 'termination_date', 'training_month', 'slack_msg', 'signature', 'role_id', 'role_name', 'eth_token' ]
console.log(row)
let rows=[];
for(let val of row){
  delete val.password;
  if(role.toString().toLowerCase()=='guest'){
    for(let[key,value] of Object.entries(val) ){
      for(let secureKey of secureKeys){
        if(key==secureKey){
          delete val.key;
        }
      }
    }
  }
  rows.push(val);
}
Return={};
Return.error=0;
Return.data=row;
return Return;
}
let getEnabledUsersList=async(req,models,sorted_by=false)=>{
  let isAdmin="";
let query;
  if(sorted_by=='salary'){
 query=await models.sequelize.query(`SELECT
 users.*,
 user_profile.*,
 salary.total_salary,
 roles.id as role_id,
 roles.name as role_name
 FROM users
 LEFT JOIN user_profile ON users.id = user_profile.user_id
 LEFT JOIN user_roles ON users.id = user_roles.user_id
 LEFT JOIN roles ON user_roles.role_id = roles.id
 LEFT JOIN ( SELECT "user_Id", MAX(total_salary) as total_salary FROM salary GROUP BY "user_Id" ) as salary ON users.id = salary."user_Id"
 where
 users.status = 'Enabled' ORDER BY salary.total_salary DESC`,{type:QueryTypes.SELECT})
  }else if(sorted_by=='dateofjoining'){
    query=await models.sequelize.query(`SELECT
    users.*,
    user_profile.*,
    roles.id as role_id,
    roles.name as role_name
    FROM users
    LEFT JOIN user_profile ON users.id = user_profile.user_id
    LEFT JOIN user_roles ON users.id = user_roles.user_id
    LEFT JOIN roles ON user_roles.role_id = roles.id
    where
    users.status = 'Enabled' ORDER BY user_profile.dateofjoining ASC`,{type:QueryTypes.SELECT})
  }else{
    query= await models.sequelize.query(`SELECT
    users.*,
    user_profile.*,
    roles.id as role_id,
    roles.name as role_name
    FROM users
    LEFT JOIN user_profile ON users.id = user_profile."user_Id"
    LEFT JOIN user_roles ON users.id = user_roles.user_id
    LEFT JOIN roles ON user_roles.role_id = roles.id
    where
    users.status = 'Enabled'`,{type:QueryTypes.SELECT})
  }
  let newRows=[];
  for(let pp of query){
    delete pp.total_salary;
    if(isAdmin===""){
      delete pp.holding_comments;
    }
    pp.slack_profile=[];
    newRows.push(pp);
  }
  // $slackUsersList = self::getSlackUsersList();
  // if (sizeof($slackUsersList) > 0) {
  //   foreach ($newRows as $key => $pp) {
  //       $pp_work_email = $pp['work_email'];
  //       $userid = $pp['user_Id'];
  //       foreach ($slackUsersList as $sl) {
  //           if ($sl['profile']['email'] == $pp_work_email) {
  //               $newRows[$key]['slack_profile'] = $sl['profile'];
  //               $newRows[$key]['slack_channel_id'] = $sl['slack_channel_id'];
  //               $slack_id = $sl['id'];
  //               $slack_profile_image = $sl['profile']['image_original'];
  //               $q = "SELECT * FROM user_profile where user_Id = $userid ";

  //               $runQuery = self::DBrunQuery($q);
  //               $row = self::DBfetchRow($runQuery);
  //               $no_of_rows = self::DBnumRows($runQuery);

  //               if ($no_of_rows > 0) {
  //                   if ($row['slack_id'] == "") {
  //                       $q2 = "UPDATE user_profile SET slack_id = '$slack_id' WHERE user_Id = $userid ";
  //                       $runQuery2 = self::DBrunQuery($q2);
  //                   }
  //                   if( $row['image'] == "" || $row['image'] != $slack_profile_image ){
  //                       $q2 = "UPDATE user_profile SET image = '$slack_profile_image' WHERE user_Id = $userid ";
  //                       $runQuery2 = self::DBrunQuery($q2);
  //                   }
  //                   // if ($row['unique_key'] == "") {
  //                   //     $bytes = uniqid();
  //                   //     $q2 = "UPDATE user_profile SET unique_key = '$bytes' WHERE user_Id = $userid ";
  //                   //     $runQuery2 = self::DBrunQuery($q2);
  //                   // }
  //               }

  //               $newRows[$key]['slack_profile']['image_72'] = $row['image'] ? $row['image'] : $slack_profile_image;
  //               $newRows[$key]['slack_profile']['image_192'] = $row['image'] ? $row['image'] : $slack_profile_image;

  //               break;
//             }
//         }
//     }
// }
// if( sizeof($newRows) > 0 ){
//   foreach ($newRows as $key => $value) {
//       $newRows[$key]['profileImage'] = self::_getEmployeeProfilePhoto($value);
//   }
// }
return newRows;
}
let getDisabledUser=async(req,models)=>{
  let query= await models.sequelize.query(`SELECT
  users.*,
  user_profile.*,
  roles.id as role_id,
  roles.name as role_name
  FROM users
  LEFT JOIN user_profile ON users.id = user_profile."user_Id"
  LEFT JOIN user_roles ON users.id = user_roles.user_id
  LEFT JOIN roles ON user_roles.role_id = roles.id
  where
  users.status = 'Disabled'`,{type:QueryTypes.SELECT})
  console.log(query)
  Return={};
  if(query.length!==0){
    Return.error=0;
    Return.data=query;
  }else{
  Return.message="No disabled User found !!"
  }
  return Return;
}
let getUserDocumentDetail=async(userid,req,models)=>{
  let r_error=1;
  let r_message="";
  let r_data=[];
  let q =await models.sequelize.query(`SELECT * FROM user_document_detail where "user_Id" = ${userid} `,{type:QueryTypes.SELECT})
 for (let [key,row] of Object.entries(q)){
   if(!isNaN(row.updated_by)&& row.updated_by>0){
    let userInfo=await getUserInfo(row.updated_by,models);
    q.key.updated_by={
      user_id:row.updated_by,
      name:userInfo.name,
      role:userInfo.role_name
    };
   }
   let link="";
   if(typeof row.link_1!=="undefined" && row.link_1!==""){
     link =row.link_1;
     link=link.replace("'></iframe>","")
     link=link.trim();
   }
 }
}

  module.exports={
    getUserDetailInfo,
    getUserBankDetail,
    getUserprofileDetail,
    getUserAssignMachines,
    getEnabledEmployeesBriefDetails,
    getEnabledUsersListWithoutPass,
    getEnabledUsersList,
    getDisabledUser,
    getUserDocumentDetail

  }