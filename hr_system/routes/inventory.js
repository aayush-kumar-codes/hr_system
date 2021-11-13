const express = require("express");
const router = express.Router();
const validators = require("../validators/req-validators");
const inventoryControllers = require("../controllers/inventory-controller");
const handlers = require("../util/responseHandlers");
const middleware = require("../middleware/Auth");

router.post('/add_office_machine', middleware.AuthForAdmin, validators.machineCreationValidator, inventoryControllers.inventoryController, handlers.responseForData); //done
router.post('/assign_user_machine', middleware.AuthForAdmin, validators.AssignUserMachineValidator,inventoryControllers.AssignUserMachineController, handlers.responseForInventory); //done
router.post("/add_inventory_audit",middleware.AuthForHr,validators.inventoryAuditValidator,inventoryControllers.inventoryAuditController,handlers.responseForInventory); //done

router.get('/get_my_inventories', middleware.AuthForHr,inventoryControllers.getMyInventoryController, handlers.responseForInventory);//done

router.post('/get_machine', middleware.AuthForHr,inventoryControllers.getMachineController,handlers.responseForInventory); //done

router.get('/get_office_machine', middleware.AuthForAdmin,inventoryControllers.inventoryGetController, handlers.responseForInventory);    //done
router.get("/get_machine_status_list",middleware.AuthForAdmin,inventoryControllers.getMachineStatusController,handlers.responseForInventory); //done

router.post("/add_machine_status",middleware.AuthForAdmin,validators.MachineStatusValidator,inventoryControllers.addMachineStatusController,handlers.responseForInventory);//done
router.post("/delete_machine_status",middleware.AuthForAdmin,validators.MachineStatusDeleteValidator,inventoryControllers.deleteMachineStatusController,handlers.responseForInventory);  //done

router.get("/get_machine_count",middleware.AuthForAdmin,inventoryControllers.getMachineCountController,handlers.responseForInventory); // done
router.get("/get_machine_type_list", middleware.AuthForAdmin,inventoryControllers.getMachineTypeController, handlers.responseForInventory);   //done

router.post("/add_machine_type",middleware.AuthForAdmin, validators.addMachineTypeValidator,inventoryControllers.addMachineTypeController, handlers.responseForAddMachine)//done

router.get("/get_machines_detail", middleware.AuthForAdmin, inventoryControllers.getMachinesDetailController, handlers.responseForInventory);// done
router.get("/get_unapproved_inventories", middleware.AuthForAdmin, inventoryControllers.getUnapprovedInventoryControllers, handlers.responseForInventory);//working

router.post("/update_office_machine",middleware.AuthForAdmin,validators.UpdateMachineValidator,inventoryControllers.inventoryUpdateMachineController,handlers.responseForInventory);//done

router.get("/get_unassigned_inventories",middleware.AuthForAdmin,inventoryControllers.getUnassignedInventoryController,handlers.responseForInventory);//done
router.get("/get_inventory_audit_status_month_wise", middleware.AuthForAdmin , inventoryControllers.monthwiseAuditStatusController, handlers.responseForInventory);//about to done
router.get("/get_temp_uploaded_inventory_files", middleware.AuthForAdmin , inventoryControllers.getTempFilesController, handlers.responseForInventory);

router.post("/delete_temp_uploaded_inventory_file", middleware.AuthForAdmin , inventoryControllers.deleteTempFilesControllers, handlers.responseForInventory);
router.post("/inventory_unassign_request", middleware.AuthForAdmin , validators.unassignRequestValidator, inventoryControllers.inventoryUnassignRequestController, handlers.responseForInventory);
router.post("/remove_machine_detail", middleware.AuthForAdmin , inventoryControllers.removeMachineController, handlers.responseForInventory);


module.exports = router;
