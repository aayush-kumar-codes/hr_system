const express = require("express");
const router = express.Router();
const validators = require("../validators/req-validators");
const leavesControllers = require("../controllers/leaves-Controller");
const handlers = require("../util/responseHandlers");
const middleware = require("../middleware/Auth");

router.post(
    "/admin_user_apply_leave",
    middleware.AuthForHrAdmin,
    validators.addRoleValidator,
    leavesControllers.adminUserApplyLeave,
    handlers.addNewEmployeeResponseHandle
  );

  module.exports = router;