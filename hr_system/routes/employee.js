var express = require('express');
var router = express.Router();
const validators = require('../validators/req-validators');
const employeeController = require('../controllers/employee-controller');
const handlers = require('../util/responseHandlers');
const middleware = require("../middleware/Auth");
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "./upload/");
//     },
//     filename: (req, file, cb) => {
//       cb(null, file.originalname);
//     },
//   });
//   const upload = multer({ storage: storage });


router.get('/get_user_profile_detail',middleware.Auth,employeeController.getUserProfileController,handlers.responseForData);
router.get('/get_user_profile_detail_by_id',middleware.Auth,employeeController.getUserProfileByIdConttroller,handlers.responseForData);
router.get('/get_enabled_users_brief_details',middleware.Auth,employeeController.getEnabledUser,handlers.responseForData);
router.get('/show_disabled_users',middleware.Auth,employeeController.getDisabledUser,handlers.responseForData);
router.get('/get_user_document',middleware.Auth,employeeController.getUserDocument,handlers.responseForData);
// router.post('/get_user_profile_detail',middleware.Auth,validators.userCreationValidator, userController.userRegister,handlers.responseHandle);
router.get("/get_employee_life_cycle", middleware.Auth, employeeController.getLifeCycleController, handlers.responseHandle);
router.post("/update_employee_life_cycle", middleware.Auth, validators.updateEmployeeVAlidator, employeeController.updateLifeCycleController, handlers.responseHandle);
router.post("/add_team_list", middleware.Auth, validators.addTeamValidator, employeeController.addTeamController, handlers.responseHandle);
router.get('/get_user_policy_document',middleware.Auth,employeeController.getUserPolicyDocument,handlers.responseForData);
router.post('/update_user_policy_document',middleware.Auth,validators.updateUserPolicyDocument,employeeController.updateUserPolicyDocument,handlers.responseForData);
// router.post('/user_document',middleware.Auth,validators.userDocument,employeeController.uploadUserDocument,handlers.responseForData);
module.exports = router;
 