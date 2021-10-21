const db = require("../db");
const providers = require("../providers/creation-provider");
const reqValidate = require("../providers/error-check");
const jwt = require("jsonwebtoken");
const secret = require("../config");

exports.inventoryController = async (req, res, next) => {
  try {
    let request_Validate = await reqValidate(req);
    let machine_create = await db.MachineList.createMachine(req.body);
    req.body.obj_id = machine_create;
    res.status_code = 201;
    res.message = "Created";
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
    res.status_code = 201;
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
    res.message = "Updated";
    return next();
  } catch (error) {
    console.log(error);
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.inventoryAuditController = async (req, res, next) => {
  try {
    let audit_create = await db.InventoryCommentsModel.createAudit(req.body);
    res.status_code = 201;
    res.data = audit_create;
    res.message = "Created";
    return next();
  } catch (error) {
    console.log(error);
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.getMyInventoryController = async (req, res, next) => {
  try {
    let machine_list = await db.MachineList.GetMachine(req, db);
    res.status_code = 200;
    res.data = machine_list;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.getMachineController = async (req, res, next) => {
  try {
    let machine_list = await db.MachineList.GetMachineById(req.body);
    res.status_code = 200;
    res.data = machine_list;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.inventoryUpdateMachineController = async (req, res, next) => {
  try {
    let updatedMachine = await db.MachineList.updateMachine(req.body);
    res.status_code = 200;
    res.message = "machine updated";
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.getUnassignedInventoryController = async (req, res, next) => {
  try {
    let unassignedInventory = await db.MachineList.getUnassignedInventory(
      req.body
    );
    res.status_code = 200;
    res.data = unassignedInventory;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.addMachineStatusController = async (req, res, next) => {
  try {
    let audit_create = await db.MachineStatus.AddMachineStatus(req.body);
    res.status_code = 201;
    res.message = "Created";
    return next();
  } catch (error) {
    console.log(error);
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.getMachineStatusController = async (req, res, next) => {
  try {
    let machine_list = await db.MachineStatus.getAllStatus();
    res.status_code = 200;
    res.data = machine_list;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.deleteMachineStatusController = async (req, res, next) => {
  try {
    let machine_list = await db.MachineStatus.DeleteStatus(req.body);
    res.status_code = 204;
    res.data = machine_list;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.getMachineCountController = async (req, res, next) => {
  try {
    let machine_count = await db.MachineList.getMachineCount();
    res.status_code = 200;
    res.data = machine_count;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.addMachineTypeController = async (req, res, next) => {
  try {
    let machineType = await db.Config.addMachineType(req.body);
    res.status_code = 200;
    res.message = "Created";
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.getMachineTypeController = async (req, res, next) => {
  try {
    let machine_type_list = await db.Config.getMachineTypeList();
    res.status_code = 200;
    res.data = machine_type_list;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.getMachinesDetailController = async (req, res, next) => {
  try {
    let machineDetails = await db.MachineList.getMachinesDetail();
    res.status_code = 200;
    res.data = machineDetails;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.getUnapprovedInventoryControllers = async (req, res, next) => {
  try {
    let unapprovedInventory = await db.MachineList.getUnapprovedInventory();
    res.status_code = 200;
    res.data = unapprovedInventory;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.removeMachineController = async(req,res,next) => {
  try {
    let removedMachine = await db.MachineList.removeMachine(req.body);
    res.status_code = 200;
    res.message = "Removed";
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
}