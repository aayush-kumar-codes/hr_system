var express = require('express');
var router = express.Router();
const validators = require('../validators/req-validators');
const employeeController = require('../controllers/employee-controller');
const handlers = require('../util/responseHandlers');
const middleware = require("../middleware/Auth");

// router.post('/get_user_profile_detail',middleware.Auth,validators.userCreationValidator, userController.userRegister,handlers.responseHandle);
router.get("/get_employee_life_cycle", middleware.Auth, employeeController.getLifeCycleController, handlers.responseHandle);
router.post("/update_employee_life_cycle", middleware.Auth, validators.updateEmployeeVAlidator, employeeController.updateLifeCycleController, handlers.responseHandle);
router.post("/add_team_list", middleware.Auth, validators.addTeamValidator, employeeController.addTeamController, handlers.responseHandle);


module.exports = router;
 