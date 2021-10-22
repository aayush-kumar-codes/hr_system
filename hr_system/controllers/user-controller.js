const db = require('../db');
const providers = require('../providers/creation-provider');
const reqUser = require('../providers/error-check');
const jwt = require('jsonwebtoken')
const secret = require('../config')

exports.userRegister = async (req, res, next) => {
	try {
		let request_Validate = await reqUser(req);
		let user_details = await providers.validateCreation(req.body);
		let user_create = await db.User.createUser(req.body);
		let create_profile = await db.UserProfile.createProfile(req.body,user_create.id);
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
		let user = await db.User.getMine(req.body);
		const token = await jwt.sign({ user_id: user, email: user.email },secret.jwtSecret,{ expiresIn: "2hr" })
		res.token = token;
		res.status_code = 200;
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
		let role_create = await db.Role.AddUserRole(req.body);
		res.status_code = 201;
		res.message = 'Created';
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
