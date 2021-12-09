const express = require("express");
const router = express.Router();
const validators = require("../validators/req-validators");
const attendanceControllers = require("../controllers/attendence-Controller");
const handlers = require("../util/responseHandlers");
const middleware = require("../middleware/Auth");

router.post(
    "/month_attendance",
    middleware.AuthForHrEmployee,
    attendanceControllers.month_attendance,
    handlers.responseForEmployee
  );
  router.post(
    "/get_all_user_previous_month_time",
    middleware.AuthForHrEmployee,
    attendanceControllers.get_all_user_previous_month_time,
    handlers.responseForEmployee
  );
  router.post(
    "/update_day_working_hours",
    middleware.AuthForHrEmployee,
    attendanceControllers.update_day_working_hours,
    handlers.responseForEmployee
  );
  router.post(
    "/multiple_add_user_working_hours",
    middleware.AuthForHrEmployee,
    attendanceControllers.multiple_add_user_working_hours,
    handlers.responseForEmployee
  );
  router.post(
    "/working_hours_summary",
    middleware.AuthForHrEmployee,
    attendanceControllers.working_hours_summary,
    handlers.responseForEmployee
  );
  router.post(
    "/add_user_working_hours",
    middleware.AuthForHrEmployee,
    attendanceControllers.add_user_working_hours,
    handlers.responseForEmployee
  );
  router.post(
    "/get_managed_user_working_hours",
    middleware.AuthForHrEmployee,
    attendanceControllers.get_managed_user_working_hours,
    handlers.responseForEmployee
  );
  router.post(
    "/update_user_day_summary",
    middleware.AuthForHrEmployee,
    attendanceControllers.update_user_day_summary,
    handlers.responseForEmployee
  );
  router.post(
    "/add_manual_attendance",
    middleware.AuthForHrEmployee,
    attendanceControllers.add_manual_attendance,
    handlers.responseForEmployee
  );
module.exports=router;