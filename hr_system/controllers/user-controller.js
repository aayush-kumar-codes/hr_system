const db = require("../db");
// const {QueryTypes} = require("sequelize");
const providers = require("../providers/creation-provider");
const reqUser = require("../providers/error-check");
const jwt = require("jsonwebtoken");
const secret = require("../config");
const md5 = require("md5");
const {
  assignUserRole,
  validateSecretKey,
  getEnabledUsersListWithoutPass,
} = require("../allFunctions");

exports.userRegister = async (req, res, next) => {
  try {
    let request_Validate = await reqUser(req);
    let user_details = await providers.validateCreation(req.body);
    let user_create = await db.User.createUser(req.body);
    req.body.user_id = user_create;
    const token = await jwt.sign(
      { user_id: user_create, email: user_create.email },
      secret.jwtSecret,
      { expiresIn: "2hr" }
    );
    res.token = token;
    res.status_code = 201;
    res.message = "Created";
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.userLogin = async (req, res, next) => {
  try {
    let request_Validate = await reqUser(req);
    // let user_details = await providers.validateCreation(req.body);
    let username = req.body.username;
    let password = md5(req.body.password);
    let email = req.body.email;
    let result = await db.User.login(username, password, email, db);
    // console.log(result.data.userId);
    res.status_code = 200;
    res.error = result.error;
    res.message = result.message;
    res.token = result.data.token;
    res.data = result.data.userId.toString();
    return next();
  } catch (error) {
    console.log(error);
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.addNewEmployeeController = async (req, res, next) => {
  try {
    let newEmployeeData = await db.UserProfile.createProfile(req.body, res, db);
    res.status_code = 200;
    console.log(newEmployeeData);
    res.data = newEmployeeData;
    return next();
  } catch (error) {
    console.log(error);
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};
exports.addUserRole = async (req, res, next) => {
  try {
    let request_Validate = await reqUser(req);
    let base_role_id = null;
    if (
      typeof req.body.base_role_id !== undefined &&
      req.base_role_id != null
    ) {
      base_role_id = req.body.base_role_id;
    }
    let name = req.body.name;
    let description = req.body.description;
    let role_create = await db.Role.AddNewRole(name, description, base_role_id);
    res.status_code = 201;
    res.error = role_create.error;
    // console.log(role_create.message);
    res.message = role_create.message;
    // res.message = 'Created';
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.getUserRole = async (req, res, next) => {
  try {
    let machine_count = await db.Role.listAllRole(db);
    res.status_code = 200;
    res.data = machine_count;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.assignUserRoleController = async (req, res, next) => {
  try {
    let userid = req.body.user_id;
    let roleid = req.body.role_id;
    let result = await assignUserRole(userid, roleid, db);
    res.status_code = 200;
    res.error = result.error;
    res.message = result.message;
    return next();
  } catch (error) {
    res.status_code = 500;
    console.log(error);
    res.message = error.message;
    return next();
  }
};

exports.getEnableUser = async (req, res, next) => {
  try {
    // const users = await db.sequelize.query("SELECT * FROM details",{ type: QueryTypes.SELECT });
    // console.log(users);
    let role;
    if (
      typeof req.body.secret_key != "undefined" &&
      req.body.secret_key != ""
    ) {
      let validate_secret = await validateSecretKey(req.body.secret_key, db);
      if (validate_secret) {
        role = "guest";
      }
    } else {
      let token = req.headers.authorization.split(" ");
      let loggedUserInfo = jwt.verify(token[1], secret.jwtSecret);
      role = loggedUserInfo.data.role;
    }
    let sorted_by =
      typeof req.body.sorted_by != "undefined" ? req.body.sorted_by : false;
    let result = await getEnabledUsersListWithoutPass(role, sorted_by, db);
	console.log(result.data);
    res.status_code = 200;
    res.error = result.error;
    res.data = result.data;
	return next();
  } catch (error) {
    console.log(error);
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.updateRoleController = async (req, res, next) => {
  try {
    let updateRole = await db.Role.updateRole(req.body, db);
    res.status_code = 200;
    res.message = updateRole;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.listAllRolesController = async (req, res, next) => {
  try {
    let listofRoles = await db.Role.getListOfRoles();
    res.status_code = 200;
    res.data = listofRoles;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};
