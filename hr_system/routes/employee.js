var express = require('express');
var router = express.Router();
const validators = require('../validators/req-validators');
const userController = require('../controllers/user-controller');
const handlers = require('../util/responseHandlers');
const middleware = require("../middleware/Auth");

router.post('/get_user_profile_detail',middleware.Auth,validators.userCreationValidator, userController.userRegister,handlers.responseHandle);

module.exports = router;
 