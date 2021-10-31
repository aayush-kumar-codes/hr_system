const db = require('../db');
const providers = require('../providers/creation-provider');
const reqUser = require('../providers/error-check');
const jwt = require('jsonwebtoken')
const secret = require('../config')
const md5 = require("md5");

exports.userRegister = async (req, res, next) => {
	try {
		let request_Validate = await reqUser(req);
		let user_details = await providers.validateCreation(req.body);
		let user_create = await db.User.createUser(req.body);
		req.body.user_id = user_create;
		const token = await jwt.sign({ user_id:user_create, email:user_create.email },secret.jwtSecret,{ expiresIn: "2hr" })
		res.token = token;
		res.status_code = 201;
		res.message = 'Created';
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
		// console.log(password);
		// if(req.body.googleAuthToken !== ""){
		// 	// let result = await db.User.loginGoogleAuth(req.body.googleAuthToken);
		// 	let result = "aditya";
		// 	res.status_code = 200;
		// 	res.data = result;
		// }else{

			let result = await db.User.login(username, password,email,db);
			res.status_code =200;
			res.data = result;
		
			// }
		// let user = await db.User.getMine(req.body);
		// const token = await jwt.sign({ user_id: user, email: user.email },secret.jwtSecret,{ expiresIn: "2hr" })
		// res.token = token;
		// if(res.token){
		// 	res.status_code = 200;
		// 	res.error = 0;
		// 	res.data = user;
		// 	res.message = "Success Login";
		// }else{
		// 	res.status_code = 401;
		// 	res.error = 1;
		// 	res.data = [];
		// 	res.message = "Login Failed";
		// }
		return next();
	} catch (error) {
		console.log(error);
		res.status_code = 500;
		res.message = error.message;
		return next();
	}
};

exports.addNewEmployeeController = async(req,res,next) => {
	try {
		let newEmployeeData = await db.UserProfile.createProfile(req.body,res,db);
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
}
exports.addUserRole = async (req, res, next) => {
	try {
		let request_Validate = await reqUser(req);
		if(req.body.base_role_id !== ""){
			let base_role_id = req.body.base_role_id;
		}
		let name = req.body.name;
		let description = req.body.description;
		let role_create = await db.Role.AddUserRole(name, description, base_role_id);
		res.status_code = 201;
		res.data = role_create;
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
		let machine_count = await db.Role.getUserRoles();
		res.status_code = 200;
		res.data = machine_count;
		return next();
	} catch (error) {														
		res.status_code = 500;
		res.message = error.message;
		return next();
	}
};

exports.assignUserRoleController = async(req,res,next) => {
	try {
		let assignUserRole = await db.UserRole.assignRole(req.body);
		res.status_code = 200;
		res.data = assignUserRole;
		return next();
	} catch (error) {
		res.status_code = 500;
		res.message = error.message;
		return next();
	}
}

exports.updateRoleController =async(req,res, next) => {
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
}

exports.listAllRolesController = async(req,res,next) => {
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
}