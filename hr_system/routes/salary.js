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
module.exports = router;