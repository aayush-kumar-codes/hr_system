var express = require('express');
var router = express.Router();
const validators = require('../validators/req-validators');
const employeeController = require('../controllers/employee-controller');
const handlers = require('../util/responseHandlers');
const middleware = require("../middleware/Auth");
const multer=require("multer")
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./upload/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage: storage });


router.get('/get_user_profile_detail',middleware.Auth,employeeController.getUserProfileController,handlers.responseForData);
router.get('/get_user_profile_detail_by_id',middleware.Auth,employeeController.getUserProfileByIdConttroller,handlers.responseForData);
router.get('/get_enabled_users_brief_details',middleware.Auth,employeeController.getEnabledUser,handlers.responseForData);
router.get('/show_disabled_users',middleware.Auth,employeeController.getDisabledUser,handlers.responseForData);
router.get('/get_user_document',middleware.Auth,employeeController.getUserDocument,handlers.responseForData);
router.post('/update_user_policy_document',middleware.Auth,validators.updateUserPolicyDocument,employeeController.updateUserPolicyDocument,handlers.responseForData);
router.post('/user_document',middleware.Auth,validators.user_document,upload.single("file"),employeeController.uploadUserDocument,handlers.responseForData);
router.get('/get_user_policy_document',middleware.Auth,employeeController.getUserPolicyDocument,handlers.responseForData);
router.get("/get_employee_life_cycle", middleware.Auth, employeeController.getLifeCycleController, handlers.responseForData);
router.post("/update_employee_life_cycle", middleware.Auth, validators.updateEmployeeVAlidator, employeeController.updateLifeCycleController, handlers.responseForData);
router.post("/add_team_list", middleware.Auth, validators.addTeamValidator, employeeController.addTeamController, handlers.responseForData);
router.get("/get_team_list",middleware.Auth, employeeController.getTeamListController, handlers.responseHandle);
router.post("/update_user_bank_detail", middleware.Auth,validators.updateBankDetailsValidator, employeeController.updateBankDetailsController, handlers.responseHandle);
router.post("/delete_role", middleware.Auth, validators.deleteRoleValidator, employeeController.deleteRoleController, handlers.responseForData);
router.post("/change_employee_status", middleware.Auth, validators.changeStatusValidator, employeeController.changeStatusController, handlers.responseForData);
router.post("/update_user_profile_detail_by_id", middleware.Auth, validators.updateUserByIdValidator, employeeController.updateUserBYIdController, handlers.responseForData);
router.post("/update_new_password", middleware.Auth, validators.updateNewPassValidator, employeeController.updateNewPassController, handlers.responseForData);
router.post("/update_employee_password", middleware.Auth, validators.updateEmployeePassValidators, employeeController.updateEmployeePassControllers, handlers.responseForData);

module.exports = router;
 