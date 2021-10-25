const express = require("express");
const router = express.Router();
const validators = require("../validators/req-validators");
const inventoryControllers = require("../controllers/inventory-controller");
const handlers = require("../util/responseHandlers");
const middleware = require("../middleware/Auth");
const cors = require('cors')

router.post('/add_office_machine', middleware.AuthForAdmin, validators.machineCreationValidator, inventoryControllers.inventoryController, handlers.responseForData); //done
router.get('/get_office_machine', middleware.AuthForAdmin,inventoryControllers.inventoryGetController, handlers.responseHandle);    //done
router.post('/assign_user_machine', middleware.AuthForAdmin, validators.AssignUserMachineValidator,inventoryControllers.AssignUserMachineController, handlers.responseForData); //done
router.get('/get_my_inventories', middleware.AuthForHr,inventoryControllers.getMyInventoryController, handlers.responseHandle);
router.post('/get_machine', middleware.AuthForHr,inventoryControllers.getMachineController,handlers.responseForData);
router.post("/add_inventory_audit",middleware.AuthForHr,validators.inventoryAuditValidator,inventoryControllers.inventoryAuditController,handlers.responseHandle);
router.post("/add_machine_status",middleware.AuthForAdmin,validators.MachineStatusValidator,inventoryControllers.addMachineStatusController,handlers.responseHandle);
router.get("/get_machine_status_list",middleware.AuthForAdmin,inventoryControllers.getMachineStatusController,handlers.responseHandle);
router.post("/delete_machine_status",middleware.AuthForAdmin,validators.MachineStatusDeleteValidator,inventoryControllers.deleteMachineStatusController,handlers.responseForData);//working on it
router.post("/update_office_machine",middleware.AuthForAdmin,validators.UpdateMachineValidator,inventoryControllers.inventoryUpdateMachineController,handlers.responseHandle);
router.get("/get_unassigned_inventories",middleware.AuthForAdmin,inventoryControllers.getUnassignedInventoryController,handlers.responseHandle);
router.get("/get_machine_count",middleware.AuthForHr,inventoryControllers.getMachineCountController,handlers.responseHandle);
router.get("/get_machine_type_list", middleware.AuthForAdmin,inventoryControllers.getMachineTypeController, handlers.responseForData);   //done
router.post("/add_machine_type",middleware.AuthForAdmin, validators.addMachineTypeValidator,inventoryControllers.addMachineTypeController, handlers.responseHandle)
router.get("/get_machines_detail", middleware.AuthForAdmin, inventoryControllers.getMachinesDetailController, handlers.responseHandle);
router.get("/get_unapproved_inventories", middleware.AuthForAdmin, inventoryControllers.getUnapprovedInventoryControllers, handlers.responseHandle);
router.get("/get_inventory_audit_status_month_wise", middleware.Auth, inventoryControllers.monthwiseAuditStatusController, handlers.responseHandle);
router.get("/get_temp_uploaded_inventory_files", middleware.Auth, inventoryControllers.getTempFilesController, handlers.responseHandle);
router.post("/delete_temp_uploaded_inventory_file", middleware.Auth, inventoryControllers.deleteTempFilesControllers, handlers.responseHandle);
router.post("/inventory_unassign_request", middleware.Auth, validators.unassignRequestValidator, inventoryControllers.inventoryUnassignRequestController, handlers.responseHandle);
router.post("/remove_machine_detail", middleware.Auth, inventoryControllers.removeMachineController, handlers.responseHandle);

module.exports = router;
