const User = require('./userModel');
// const Address = require('./addressModel');
const MachineList = require('./machineListModel');
const MachineUser = require('./machineUserModel');
const InventoryTempFiles = require("./inventoryTempFilesModel")
const InventoryAuditMonthWise = require('./inventoryAuditMonthWiseModel');
const InventoryCommentsModel = require('./inventoryCommentsModel');
const FilesModel = require('./filesModel');
const MachineStatus = require('./machineStatusModel');
const Role = require('./roleModel');
const Config = require("./configModel");


module.exports = { User, MachineList, MachineUser, InventoryTempFiles,InventoryAuditMonthWise, InventoryCommentsModel, FilesModel, MachineStatus, Role, Config };
