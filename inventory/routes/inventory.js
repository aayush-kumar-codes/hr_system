const express = require("express");
const router = express.Router();
const validators = require("../validators/req-validators");
const inventoryControllers = require("../controllers/inventory-controller");
const handlers = require("../util/responseHandlers");
const middleware = require("../middleware/Auth");

router.post(
  "/add_office_machine",
  middleware.Auth,
  validators.machineCreationValidator,
  inventoryControllers.inventoryController,
  handlers.responseHandle
);
router.get(
  "/get_office_machine",
  middleware.Auth,
  inventoryControllers.inventoryGetController,
  handlers.responseHandle
);
router.post(
  "/assign_user_machine",
  middleware.Auth,
  validators.AssignUserMachineValidator,
  inventoryControllers.AssignUserMachineController,
  handlers.responseHandle
);
router.get(
  "/get_my_inventories",
  middleware.Auth,
  inventoryControllers.getMyInventoryController,
  handlers.responseHandle
);

router.post(
  "/add_inventory_audit",
  middleware.Auth,
  validators.inventoryAuditValidator,
  inventoryControllers.inventoryAuditController,
  handlers.responseHandle
);

router.post(
  "/update_office_machine",
  middleware.Auth,
  validators.UpdateMachineValidator,
  inventoryControllers.inventoryUpdateMachineController,
  handlers.responseHandle
);

module.exports = router;
