const express = require("express");
const router = express.Router();
const validators = require("../validators/req-validators");
const settignsController = require("../controllers/settings-Controller");
const handlers = require("../util/responseHandlers");
const middleware = require("../middleware/Auth");

router.post(
  "/get_generic_configuration",
  middleware.AuthForHrEmployee,
  settignsController.get_generic_configuration,
  handlers.newResponse
);

router.post(
  "/update_config",
  middleware.AuthForHrAdmin,
  settignsController.update_config,
  handlers.responseForAddMachine
);

router.post(
  "/get_average_working_hours",
  middleware.AuthForHrAdmin,
  settignsController.get_average_working_hours,
  handlers.responseForAddMachine
);


module.exports = router;
