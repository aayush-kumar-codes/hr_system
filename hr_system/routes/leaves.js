const express = require("express");
const router = express.Router();
const validators = require("../validators/req-validators");
const leavesControllers = require("../controllers/leaves-Controller");
const handlers = require("../util/responseHandlers");
const middleware = require("../middleware/Auth");

router.post(
    "/admin_user_apply_leave",
    middleware.AuthForHrAdmin,
    leavesControllers.adminUserApplyLeave,
    handlers.addNewEmployeeResponseHandle
  );
router.post(
  "/delete_holiday",
  middleware.AuthForHrAdmin,
  leavesControllers.delete_holiday,
  handlers.responseForData
)
router.post(
  "/add_holiday",
  middleware.AuthForHrAdmin,
  leavesControllers.add_holiday,
  handlers.responseForData
)
router.post(
  "/get_holiday_types_list",
  middleware.AuthForHrAdmin,
  leavesControllers.get_holiday_types_list,
  handlers.responseForData
)
router.post(
  "/get_holidays_list",
  middleware.AuthForHrAdmin,
  leavesControllers.get_holidays_list,
  handlers.responseForLeaveApis
)
router.post(
  "/cancel_applied_leave",
  middleware.AuthForHrAdmin,
  leavesControllers.cancel_applied_leave,
  handlers.responseForLeaveApis
)
  module.exports = router;