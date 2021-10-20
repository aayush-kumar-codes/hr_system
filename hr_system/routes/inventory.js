const express = require("express");
const router = express.Router();
const validators = require("../validators/req-validators");
const inventoryControllers = require("../controllers/inventory-controller");
const handlers = require("../util/responseHandlers");
const middleware = require("../middleware/Auth");

router.post('/add_office_machine', middleware.Auth, validators.machineCreationValidator, inventoryControllers.inventoryController, handlers.responseHandle);
router.get('/get_office_machine', middleware.Auth,inventoryControllers.inventoryGetController, handlers.responseHandle);
router.post('/assign_user_machine', middleware.Auth, validators.AssignUserMachineValidator,inventoryControllers.AssignUserMachineController, handlers.responseHandle);
router.get('/get_my_inventories', middleware.Auth,inventoryControllers.getMyInventoryController, handlers.responseHandle);
router.post('/get_machine', middleware.Auth,inventoryControllers.getMachineController, handlers.responseHandle);
router.post("/add_inventory_audit",middleware.Auth,validators.inventoryAuditValidator,inventoryControllers.inventoryAuditController,handlers.responseHandle);
router.post("/add_machine_status",middleware.Auth,validators.MachineStatusValidator,inventoryControllers.addMachineStatusController,handlers.responseHandle);
router.get("/get_machine_status_list",middleware.Auth,inventoryControllers.getMachineStatusController,handlers.responseHandle);
router.post("/delete_machine_status",middleware.Auth,validators.MachineStatusDeleteValidator,inventoryControllers.deleteMachineStatusController,handlers.responseHandle);
router.post("/update_office_machine",middleware.Auth,validators.UpdateMachineValidator,inventoryControllers.inventoryUpdateMachineController,handlers.responseHandle);
router.get("/get_unassigned_inventories",middleware.Auth,inventoryControllers.getUnassignedInventoryController,handlers.responseHandle);
router.get("/get_machine_count",middleware.Auth,inventoryControllers.getMachineCountController,handlers.responseHandle);


module.exports = router;
