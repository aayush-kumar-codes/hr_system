const User = require("./userModel");
const Address = require("./addressModel");
const MachineList = require("./machineListModel");
const MachineUser = require("./machineUserModel");
const InventoryTempFiles = require("./inventoryTempFilesModel")
const InventoryAuditMonthWise = require("./inventoryAuditMonthWiseModel");
const InventoryCommentsModel = require("./inventoryCommentsModel");
const FilesModel = require("./filesModel");
const MachineStatus = require("./machineStatusModel");
const Config = require("./configModel");

module.exports = {
  User,
  Address,
  MachineList,
  MachineUser,
  InventoryAuditMonthWise,
  InventoryCommentsModel,
  FilesModel,
  MachineStatus,
  Config,
  InventoryTempFiles,
};
