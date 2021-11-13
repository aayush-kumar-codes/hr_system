var express = require('express');
var router = express.Router();
const validators = require('../validators/req-validators');
const userController = require('../controllers/user-controller');
const handlers = require('../util/responseHandlers');
const middleware = require("../middleware/Auth");
 
router.post('/register', validators.userCreationValidator, userController.userRegister,handlers.responseForData); //done
router.post('/login',validators.userLoginValidator,userController.userLogin,handlers.responseHandle); //done
router.post('/add_roles',middleware.AuthForAdmin,validators.addRoleValidator,userController.addUserRole,handlers.addNewEmployeeResponseHandle); //done
router.get('/list_all_roles',middleware.AuthForAdmin,userController.getUserRole,handlers.resForList); //done
router.post("/add_new_employee", middleware.AuthForHr, validators.addNewEmployeeValidator ,userController.addNewEmployeeController, handlers.addNewEmployeeResponseHandle); //done
router.post("/assign_user_role", middleware.AuthForAdmin, validators.assignUserRoleValidator, userController.assignUserRoleController, handlers.addNewEmployeeResponseHandle); //done
router.post("/get_enable_user", middleware.AuthForAdmin, userController.getEnableUser, handlers.newResponse); //done
router.post("/update_role", middleware.AuthForAdmin, validators.updateRoleValidators, userController.updateRoleController, handlers.responseHandle); //done
// router.get("/list_all_roles", middleware.AuthForHr, userController.listAllRolesController, handlers.responseHandle);
module.exports = router;
