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


router.get('/get_user_profile_detail',middleware.AuthForHr,employeeController.getUserProfileController,handlers.responseForEmployee);
router.post('/get_user_profile_detail_by_id',middleware.AuthForAdmin,employeeController.getUserProfileByIdConttroller,handlers.responseForEmployee);
router.get('/get_enabled_users_brief_details',middleware.AuthForAdmin,employeeController.getEnabledUser,handlers.responseForEmployee);
router.get('/show_disabled_users',middleware.AuthForAdmin,employeeController.getDisabledUser,handlers.responseForEmployee);
router.post('/get_user_document',middleware.AuthForHr,employeeController.getUserDocument,handlers.responseForEmployee);
router.post('/update_user_policy_document',middleware.AuthForHr,validators.updateUserPolicyDocument,employeeController.updateUserPolicyDocument,handlers.responseForEmployee);
router.post('/user_document',middleware.AuthForHr,validators.user_document,upload.single("file"),employeeController.uploadUserDocument,handlers.responseForEmployee);
router.get('/get_user_policy_document',middleware.AuthForHr,employeeController.getUserPolicyDocument,handlers.responseForEmployee);

router.get("/get_employee_life_cycle", middleware.Auth, employeeController.getLifeCycleController, handlers.responseForEmployee);
router.post("/update_employee_life_cycle", middleware.Auth, validators.updateEmployeeVAlidator, employeeController.updateLifeCycleController, handlers.responseForEmployee);
router.post("/add_team_list", middleware.Auth, validators.addTeamValidator, employeeController.addTeamController, handlers.responseForEmployee);
router.get("/get_team_list",middleware.Auth, employeeController.getTeamListController, handlers.responseForEmployee);
router.post("/update_user_bank_detail", middleware.Auth,validators.updateBankDetailsValidator, employeeController.updateBankDetailsController, handlers.responseForEmployee);
router.post("/delete_role", middleware.Auth, validators.deleteRoleValidator, employeeController.deleteRoleController, handlers.responseForEmployee);
router.post("/change_employee_status", middleware.Auth, validators.changeStatusValidator, employeeController.changeStatusController, handlers.responseForEmployee);
router.post("/update_user_profile_detail_by_id", middleware.Auth, validators.updateUserByIdValidator, employeeController.updateUserBYIdController, handlers.responseForEmployee);
router.post("/update_new_password", middleware.Auth, validators.updateNewPassValidator, employeeController.updateNewPassController, handlers.responseForEmployee);
router.post("/update_employee_password", middleware.Auth, validators.updateEmployeePassValidators, employeeController.updateEmployeePassControllers, handlers.responseForEmployee);

module.exports = router;
 