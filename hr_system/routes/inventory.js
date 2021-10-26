const express = require("express");
const router = express.Router();
const validators = require("../validators/req-validators");
const inventoryControllers = require("../controllers/inventory-controller");
const handlers = require("../util/responseHandlers");
const middleware = require("../middleware/Auth");
const cors = require('cors')

router.post('/add_office_machine', middleware.AuthForAdmin, validators.machineCreationValidator, inventoryControllers.inventoryController, handlers.responseForData); //done
router.get('/get_office_machine', middleware.AuthForAdmin,inventoryControllers.inventoryGetController, handlers.responseForInventory);    //done
router.post('/assign_user_machine', middleware.AuthForAdmin, validators.AssignUserMachineValidator,inventoryControllers.AssignUserMachineController, handlers.responseForInventory); //done
router.get('/get_my_inventories', middleware.AuthForHr,inventoryControllers.getMyInventoryController, handlers.responseForInventory);
router.post('/get_machine', middleware.AuthForAdmin,inventoryControllers.getMachineController,handlers.responseForInventory); //working
router.post("/add_inventory_audit",middleware.AuthForHr,validators.inventoryAuditValidator,inventoryControllers.inventoryAuditController,handlers.responseForInventory);
router.post("/add_machine_status",middleware.AuthForAdmin,validators.MachineStatusValidator,inventoryControllers.addMachineStatusController,handlers.responseForInventory);
router.get("/get_machine_status_list",middleware.AuthForAdmin,inventoryControllers.getMachineStatusController,handlers.responseForInventory); 
router.post("/delete_machine_status",middleware.AuthForAdmin,validators.MachineStatusDeleteValidator,inventoryControllers.deleteMachineStatusController,handlers.responseForInventory);  //done
router.post("/update_office_machine",middleware.AuthForAdmin,validators.UpdateMachineValidator,inventoryControllers.inventoryUpdateMachineController,handlers.responseForInventory);
router.get("/get_unassigned_inventories",middleware.AuthForAdmin,inventoryControllers.getUnassignedInventoryController,handlers.responseForInventory);
router.get("/get_machine_count",middleware.AuthForHr,inventoryControllers.getMachineCountController,handlers.responseForInventory);
router.get("/get_machine_type_list", middleware.AuthForAdmin,inventoryControllers.getMachineTypeController, handlers.responseForInventory);   //done
router.post("/add_machine_type",middleware.AuthForAdmin, validators.addMachineTypeValidator,inventoryControllers.addMachineTypeController, handlers.responseForInventory)
router.get("/get_machines_detail", middleware.AuthForAdmin, inventoryControllers.getMachinesDetailController, handlers.responseForInventory);
router.get("/get_unapproved_inventories", middleware.AuthForAdmin, inventoryControllers.getUnapprovedInventoryControllers, handlers.responseForInventory);
router.get("/get_inventory_audit_status_month_wise", middleware.Auth, inventoryControllers.monthwiseAuditStatusController, handlers.responseForInventory);
router.get("/get_temp_uploaded_inventory_files", middleware.Auth, inventoryControllers.getTempFilesController, handlers.responseForInventory);
router.post("/delete_temp_uploaded_inventory_file", middleware.Auth, inventoryControllers.deleteTempFilesControllers, handlers.responseForInventory);
router.post("/inventory_unassign_request", middleware.Auth, validators.unassignRequestValidator, inventoryControllers.inventoryUnassignRequestController, handlers.responseForInventory);
router.post("/remove_machine_detail", middleware.Auth, inventoryControllers.removeMachineController, handlers.responseForInventory);

module.exports = router;
