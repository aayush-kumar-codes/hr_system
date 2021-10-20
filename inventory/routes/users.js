var express = require('express');
var router = express.Router();
const validators = require('../validators/req-validators');
const userController = require('../controllers/user-controller');
const handlers = require('../util/responseHandlers');

router.post('/register', validators.userCreationValidator, userController.userRegister,handlers.responseHandle);
router.post('/login',validators.userLoginValidator,userController.userLogin,handlers.responseHandle);

module.exports = router;
 