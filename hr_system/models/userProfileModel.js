const md5 = require("md5");
const { randomString} = require("../allFunctions")
const { Op, QueryTypes } = require("sequelize");
const sendEmail = require("../util/sendEmail");
function user_profile(database, type) {
  const user_profile = database.define(
    "user_profile",
    {
      name: type.STRING,
      jobtitle: type.STRING,
      dateofjoining: type.DATE,
      user_Id: type.INTEGER,
      dob: type.DATE,
      gender: type.STRING,
      marital_status: type.STRING,
      address1: type.STRING,
      address2: type.STRING,
      city: type.STRING,
      state: type.STRING,
      zip_postal: type.INTEGER,
      country: type.STRING,
      home_ph: type.STRING,
      mobile_ph: type.STRING,
      work_email: type.STRING,
      other_email: type.STRING,
      image: type.STRING,
      bank_account_num: type.INTEGER,
      special_instructions: type.STRING,
      pan_card_num: type.STRING,
      permanent_address: type.STRING,
      current_address: type.STRING,
      emergency_ph1: type.STRING,
      emergency_ph2: type.STRING,
      blood_group: type.STRING,
      medical_condition: type.STRING,
      updated_on: type.STRING,
      slack_id: type.STRING,
      policy_document: type.STRING,
      team: type.STRING,
      training_completion_date: type.DATE,
      termination_date: type.DATE,
      holding_comments: type.STRING,
      training_month: type.INTEGER,
      slack_msg: type.INTEGER,
      signature: type.STRING,
      meta_data: type.STRING,
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  // user_profile. = async(reqBody) => {
  // user_profile.registerProfile = async (reqBody, user_id) => {
  //   try {
  //     let creation = await user_profile.create({
  //       name: reqBody.name,
  //       jobtitle: reqBody.jobtitle,
  //       dateofjoining: reqBody.dateofjoining,
  //       user_Id: user_id,
  //       dob: reqBody.dateofjoining,
  //       gender: reqBody.gender,
  //       marital_status: reqBody.marital_status,
  //       address1: reqBody.address1,
  //       address2: reqBody.address2,
  //       city: reqBody.city,
  //       state: reqBody.state,
  //       zip_postal: reqBody.zip_postal,
  //       country: reqBody.country,
  //       home_ph: reqBody.home_ph,
  //       mobile_ph: reqBody.mobile_ph,
  //       work_email: reqBody.workemail,
  //       other_email: reqBody.email,
  //       image: reqBody.image,
  //       bank_account_num: reqBody.bank_account_num,
  //       special_instructions: reqBody.special_instructions,
  //       pan_card_num: reqBody.pan_card_num,
  //       permanent_address: reqBody.permanent_address,
  //       current_address: reqBody.current_address,
  //       emergency_ph1: reqBody.emergency_ph1,
  //       emergency_ph2: reqBody.emergency_ph2,
  //       blood_group: reqBody.blood_group,
  //       medical_condition: reqBody.medical_condition,
  //       updated_on: reqBody.updated_on,
  //       slack_id: reqBody.slack_id,
  //       policy_document: reqBody.policy_document,
  //       team: reqBody.team,
  //       training_completion_date: reqBody.training_completion_date,
  //       termination_date: reqBody.termination_date,
  //       holding_comments: reqBody.holding_comments,
  //       training_month: reqBody.training_month,
  //       slack_msg: reqBody.slack_msg,
  //       signature: reqBody.signature,
  //       meta_data: reqBody.meta_data,
  //     });
  //     return creation.id;
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  //   // let username = await models.User.findAll({
  //   //   where: { username: reqBody.username },
  //   // });
  // };

  user_profile.addNewEmployee = async (reqBody, models) => {
    try {
      // console.log(1);
      let error = 1;
      let message;
      let userId;
      let password =  await randomString(5);
      let username = await models.User.findAll({
        where: { username: reqBody.username },
      });
      // console.log(username);
      let workemail = await user_profile.findAll({
        where: { work_email: reqBody.workemail },
      });
      let otheremail = await user_profile.findAll({
        where: { other_email: reqBody.email },
      });
      if (username.length !== 0) {
        error = 1;
        message = "username exists";
      } else if (workemail.length !== 0) {
        error = 1;
        message = "workemail exists";
      } else if (otheremail.length !== 0) {
        error = 1;
        message = "personal email exists";
      } else {
        let type = "Employee";
        passwordString = md5(password);
        let status = "Enabled";
        let userCreation = await models.User.create({
          username: reqBody.username,
          password: passwordString,
          status: status,
          type: type,
        });
        userId = userCreation.id;
        // console.log(userId);
        if (!userId) {
          error = 1;
          message = "Error occured while adding user";
        } else {
          // console.log("aditya");
          let userProfileData = await user_profile.create({
            name: reqBody.name,
            jobtitle: reqBody.jobtitle,
            dateofjoining: reqBody.dateofjoining,
            user_Id: userId,
            dob: reqBody.dob,
            gender: reqBody.gender,
            work_email: reqBody.workemail,
            training_month: reqBody.training_month,
            other_email: reqBody.email,
          });
          // console.log(userProfileData);
          if (userProfileData == null) {
            let userDelete = await models.User.destroy({
              where: { id: userId },
            });
            error = 1;
            message = "Error in adding new.";
          } else {
            error = 0;
            message = "Employee added Successfully";
            if (reqBody.notifyNewEmpHrms == true) {
              let username = reqBody.username;
              await sendEmail(
                reqBody.workemail,
                reqBody.email,
                "welcome email",
                `username: ${username}, password: ${passwordString}`
              );
            }
            let allRoles = await models.Role.findAll({});
            for (let roles in allRoles) {
              // console.log(allRoles[roles].name);
              if (allRoles[roles].name == "Employee") {
                let defaultRoleId = allRoles[roles].id;
                if (userId && defaultRoleId !== "") {
                  let roleToAssign = await models.UserRole.assignRole(
                    userId,
                    defaultRoleId
                  );
                } else {
                  error = 1;
                  message = "role not assigned";
                }
              }
            }
          }
        }
      }
      let Return = {};
      let data = {};
      data.userID = userId;
      data.password = password;
      Return.error = error;
      Return.message = message;
      Return.data = data;
      // console.log(Return);
      return Return;
    } catch (error) {
      // console.log(error);
      throw new Error(error);
    }
  };

  user_profile.getUserProfile = async () => {
    try {
      let UserProfile = await user_profile.findAll({});
      return UserProfile;
    } catch (error) {
      throw new Error("Unable to find User profile");
    }
  };

  user_profile.getUserProfileDetailsById = async (reqBody) => {
    try {
      let userProfileById = await user_profile.findAll({
        where: { user_Id: reqBody.user_id },
      });
      return userProfileById;
    } catch (error) {
      throw new Error(error);
    }
  };

  // user_profile.addNewEmployee = async (reqBody, models) => {
  //   try {
  //     let error =1;
  //     let message = "";
  //     let data = [];
  //     let q =  await models.sequelize.query(
  //       `select * from users where username='${reqBody.username}' `,
  //       { type: QueryTypes.SELECT }
  //     );
  //   } catch (error) {
  //     throw new Error (error);
  //   }
  // }
  user_profile.getUserPolicyDocument = async (req) => {
    try {
      const user_id = req.userData.user_id;
      let userPolicyDocument = await user_profile.findAll({
        where: { user_Id: user_id },
      });
      return userPolicyDocument;
    } catch (error) {
      throw new Error(error);
    }
  };

  user_profile.updateUserPolicyDocument = async (req) => {
    try {
      let userPolicyDocument = await user_profile.update(
        { policy_document: req.body.policy_document },
        { where: { user_Id: user_id } }
      );
      return userPolicyDocument;
    } catch (error) {
      // console.log(error);
      throw new Error(error);
    }
  };
  user_profile.updateUserById = async (reqBody) => {
    try {
      let userToUpdate = await user_profile.update(
        {
          name: reqBody.name,
          jobtitle: reqBody.jobtitle,
          dateofjoining: reqBody.dateofjoining,
          dob: reqBody.dateofjoining,
          gender: reqBody.gender,
          marital_status: reqBody.marital_status,
          address1: reqBody.address1,
          address2: reqBody.address2,
          city: reqBody.city,
          state: reqBody.state,
          zip_postal: reqBody.zip_postal,
          country: reqBody.country,
          home_ph: reqBody.home_ph,
          mobile_ph: reqBody.mobile_ph,
          work_email: reqBody.workemail,
          other_email: reqBody.email,
          image: reqBody.image,
          bank_account_num: reqBody.bank_account_num,
          special_instructions: reqBody.special_instructions,
          pan_card_num: reqBody.pan_card_num,
          permanent_address: reqBody.permanent_address,
          current_address: reqBody.current_address,
          emergency_ph1: reqBody.emergency_ph1,
          emergency_ph2: reqBody.emergency_ph2,
          blood_group: reqBody.blood_group,
          medical_condition: reqBody.medical_condition,
          updated_on: reqBody.updated_on,
          slack_id: reqBody.slack_id,
          policy_document: reqBody.policy_document,
          team: reqBody.team,
          training_completion_date: reqBody.training_completion_date,
          termination_date: reqBody.termination_date,
          holding_comments: reqBody.holding_comments,
          training_month: reqBody.training_month,
          slack_msg: reqBody.slack_msg,
          signature: reqBody.signature,
          meta_data: reqBody.meta_data,
        },
        { where: { user_Id: reqBody.user_id } }
      );
      // console.log(userToUpdate[0] !== 0);
      if (userToUpdate[0] !== 0) {
        return "updated";
      } else {
        return "not updated";
      }
    } catch (error) {
      // console.log(error);
      throw new Error(error);
    }
  };
  return user_profile;
}

module.exports = user_profile;
