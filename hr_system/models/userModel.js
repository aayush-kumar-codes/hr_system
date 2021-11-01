function user(database, type) {
  const {
    generateUserToken,
    getUserInfoByWorkEmail,
    getUserInfo,
  } = require("../allFunctions");
  const jwt = require("jsonwebtoken");
  const secret = require("../config");
  const { Op } = require("sequelize");
  const User = database.define(
    "detail",
    {
      username: {
        type: type.STRING,
        unique: true,
      },
      type: type.STRING,
      password: type.STRING,
      status: type.STRING,
    },
    {
      hooks: {
        beforeCreate: (user, options) => {
          return new Promise((resolve, reject) => {
            User.findOne({ where: { username: user.username } }).then(
              (found) => {
                if (found) {
                  reject(new Error("username already exist"));
                } else {
                  resolve();
                }
              }
            );
          });
        },
      },
    }
  );

  User.login = async (
    username,
    password,
    email,
    models,
    forceLoginForUsername
  ) => {
    try {
      let error = 1;
      let message;
      let data = {};
      let login_by_email = false;
      // if (!forceLoginForUsername) {
      let query = await User.findOne({
        where: {
          [Op.and]: [
            { username: username },
            { password: password },
            { status: "Enabled" },
          ],
        },
      });
      let userData = await getUserInfoByWorkEmail(email, models);
      if ((userData.userProfile.user_Id && userData.user.password) !== "") {
        if (userData.user.password == password) {
          login_by_email = true;
        } else {
          login_by_email = false;
        }
      }
      if (query == null) {
        error = 1;
        message = "invalid login";
      } else {
        let userId = query.id != null ? query.id : userData.userProfile.user_Id;
        let userInfo = await getUserInfo(userId, models);
        if (userInfo == null) {
          message = "Invalid Login";
        } else {
          is_super_admin = false;
          if (userInfo.users.type.toLowerCase() == "admin") {
            is_super_admin = true;
          }
          if (is_super_admin == false && userInfo.user_roles.role_id == null) {
            error = 1;
            message = "Role is not assigned.Contact Admin";
          } else {
            error = 0;
            message = "Success login";
            let jwtToken = await generateUserToken(
              userInfo.user_profile.user_Id,
              models
            );
            data.token = jwtToken;
            data.userId = userInfo.user_profile.user_Id;
          }
        }
      }
      let Return = {};
      Return.error = error;
      Return.message = message;
      Return.data = data;
      return Return;
      // }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  // User.getMine = async (reqBody) => {
  //   try {
  //     let user = await User.findOne({ where: { username: reqBody.username } });
  //     if (user) {
  //       return user.id;
  //     } else {
  //       return "login unsuccessful";
  //     }
  //   } catch (error) {
  //     throw new Error("Unable to find your profile");
  //   }
  // };

  User.getAll = async (limit, offset) => {
    try {
      let users_all = await User.findAll({ limit, offset });
      return users_all;
    } catch (error) {
      throw new Error("Unable to locate all users");
    }
  };

  User.createUser = async (reqBody) => {
    try {
      let creation = await User.create({
        status: reqBody.status,
        type: reqBody.type,
        password: reqBody.password,
        username: reqBody.username,
      });
      return creation.id;
    } catch (error) {
      throw new Error(error);
    }
  };
  User.getEnabledUsers = async () => {
    try {
      let enabledUsers = await User.findAll({ where: { status: "enabled" } });
      return enabledUsers;
    } catch (error) {
      throw new Error(error);
    }
  };
  User.getDisabledUsers = async () => {
    try {
      let disabledUsers = await User.findAll({ where: { status: "disabled" } });
      return disabledUsers;
    } catch (error) {
      throw new Error(error);
    }
  };

  User.changeStatus = async (reqBody) => {
    try {
      let statusToChange = await User.update(
        { status: reqBody.status },
        { where: { id: reqBody.user_id } }
      );
      if (statusToChange[0] !== 0) {
        return "updated";
      } else {
        return "not updated";
      }
    } catch (error) {
      throw new Error(error);
    }
  };
  User.updatePassword = async (reqBody, userData) => {
    try {
      let passwordToUpdate = await User.update(
        { password: reqBody.password },
        { where: { id: userData.user_id } }
      );
      //   console.log(passwordToUpdate[0]);
      if (passwordToUpdate[0] !== 0) {
        return "updated password";
      } else {
        return "updated password";
      }
    } catch (error) {
      throw new Error(error);
    }
  };
  User.empUpdatePass = async (reqBody) => {
    try {
      let empPassToUpdate = await User.update(
        { password: reqBody.password },
        { where: { id: reqBody.empid } }
      );
      if (empPassToUpdate[0] !== 0) {
        return "updated password";
      } else {
        return "not updated";
      }
    } catch (error) {
      throw new Error(error);
    }
  };
  return User;
}

module.exports = user;
