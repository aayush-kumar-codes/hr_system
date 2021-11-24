var express = require("express");
var router = express.Router();
const validators = require("../validators/req-validators");
const userController = require("../controllers/user-controller");
const handlers = require("../util/responseHandlers");
const middleware = require("../middleware/Auth");

router.post(
  "/register",
  validators.userCreationValidator,
  userController.userRegister,
  handlers.responseForData
);
router.post(
  "/login",
  validators.userLoginValidator,
  userController.userLogin,
  handlers.responseHandle
);
router.post(
  "/add_roles",
  middleware.AuthForHrAdmin,
  validators.addRoleValidator,
  userController.addUserRole,
  handlers.addNewEmployeeResponseHandle
);
router.get(
  "/list_all_roles",
  middleware.AuthForHrAdmin,
  userController.getUserRole,
  handlers.resForList
);
router.post(
  "/add_new_employee",
  middleware.AuthForHr,
  validators.addNewEmployeeValidator,
  userController.addNewEmployeeController,
  handlers.addNewEmployeeResponseHandle
);
router.post(
  "/assign_user_role",
  middleware.AuthForHrAdmin,
  validators.assignUserRoleValidator,
  userController.assignUserRoleController,
  handlers.addNewEmployeeResponseHandle
);
router.post(
  "/get_enable_user",
  middleware.AuthForHrAdmin,
  userController.getEnableUser,
  handlers.newResponse
);
router.post(
  "/update_role",
  middleware.AuthForHrAdmin,
  validators.updateRoleValidators,
  userController.updateRoleController,
  handlers.responseHandle
);

// router.get("/list_all_roles", middleware.AuthForHr, userController.listAllRolesController, handlers.responseHandle);
module.exports = router;
