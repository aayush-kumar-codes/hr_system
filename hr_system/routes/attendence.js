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

module.exports=router;