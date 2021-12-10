const express = require("express");
const router = express.Router();
const validators = require("../validators/req-validators");
const salaryController = require("../controllers/salary-Controller");
const handlers = require("../util/responseHandlers");
const middleware = require("../middleware/Auth");
router.post(
    "/delete_salary",
    middleware.AuthForHrEmployee,
    salaryController.delete_salary,
    handlers.newResponse
  );
  router.post(
    "/get_user_manage_payslips_data",
    middleware.AuthForHrEmployee,
    salaryController.get_user_manage_payslips_data,
    handlers.newResponse
  );
  router.post(
    "/get_user_salary_info_by_id",
    middleware.AuthForHrEmployee,
    salaryController.get_user_salary_info_by_id,
    handlers.newResponse
  );
module.exports = router;
