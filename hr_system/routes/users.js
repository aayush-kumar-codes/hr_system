var express = require('express');
var router = express.Router();
const validators = require('../validators/req-validators');
const userController = require('../controllers/user-controller');
const handlers = require('../util/responseHandlers');
const middleware = require("../middleware/Auth");

router.post('/register', validators.userCreationValidator, userController.userRegister,handlers.responseForData);
router.post('/login',validators.userLoginValidator,userController.userLogin,handlers.responseHandle);
router.post('/add_roles',middleware.AuthForAdmin,validators.addRoleValidator,userController.addUserRole,handlers.responseHandle);
router.get('/list_all_roles',middleware.AuthForAdmin,userController.getUserRole,handlers.responseHandle);
router.post("/add_new_employee", middleware.AuthForHr, validators.addNewEmployeeValidator ,userController.addNewEmployeeController, handlers.responseHandle)
router.post("/assign_user_role", middleware.AuthForAdmin, validators.assignUserRoleValidator, userController.assignUserRoleController, handlers.responseHandle);
router.post("/update_role", middleware.AuthForAdmin, validators.updateRoleValidators, userController.updateRoleController, handlers.responseHandle);
router.get("/list_all_roles", middleware.AuthForHr, userController.listAllRolesController, handlers.responseHandle);
module.exports = router;
 