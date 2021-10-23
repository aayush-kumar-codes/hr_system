var express = require('express');
var router = express.Router();
const validators = require('../validators/req-validators');
const employeeController = require('../controllers/employee-controller');
const handlers = require('../util/responseHandlers');
const middleware = require("../middleware/Auth");

router.get('/get_user_profile_detail',middleware.Auth,employeeController.getUserProfileController,handlers.responseHandle);
router.get('/get_user_profile_detail_by_id',middleware.Auth,employeeController.getUserProfileByIdConttroller,handlers.responseHandle);
router.get('/get_enabled_users_brief_details',middleware.Auth,employeeController.getEnabledUser,handlers.responseHandle);
router.get('/show_disabled_users',middleware.Auth,employeeController.getDisabledUser,handlers.responseHandle);
router.get('/get_user_document_by_id',middleware.Auth,employeeController.getUserDocumentById,handlers.responseHandle);
module.exports = router;
 