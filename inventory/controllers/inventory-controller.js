const db = require('../db');
const providers = require('../providers/creation-provider');
const reqValidate = require('../providers/error-check');
const jwt = require('jsonwebtoken')
const secret = require('../config')


exports.inventoryController = async (req, res, next) => {
	try {
		let request_Validate = await reqValidate(req);
		let machine_create = await db.MachineList.createMachine(req.body);
		req.body.obj_id = machine_create;
		res.status_code = 201;
		res.message = 'Created';
		return next();
	} catch (error) {														
		res.status_code = 500;
		res.message = error.message;
		return next();
	}
};



exports.inventoryGetController = async (req, res, next) => {
	try {
		let machine_list = await db.MachineList.getAll();
		res.status_code = 200;
		res.data = machine_list;
		return next();
	} catch (error) {														
		res.status_code = 500;
		res.message = error.message;
		return next();
	}
};



exports.AssignUserMachineController = async (req, res, next) => {
	try {
		let request_Validate = await reqValidate(req);
		let machine_create = await db.MachineUser.AssignMachine(req);
		res.status_code = 200;
		res.message = 'Updated';
		return next();
	} catch (error) {	
		console.log(error)													
		res.status_code = 500;
		res.message = error.message;
		return next();
	}
};



exports.getMyInventoryController = async (req, res, next) => {
	try {
		let machine_list = await db.MachineList.GetMachine(req,db);
		res.status_code = 200;
		res.data = machine_list;
		return next();
	} catch (error) {														
		res.status_code = 500;
		res.message = error.message;
		return next();
	}
};

