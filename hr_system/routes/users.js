var express = require('express');
var router = express.Router();
const validators = require('../validators/req-validators');
const userController = require('../controllers/user-controller');
const handlers = require('../util/responseHandlers');
const middleware = require("../middleware/Auth");

router.post('/register', validators.userCreationValidator, userController.userRegister,handlers.responseHandle);
router.post('/login',validators.userLoginValidator,userController.userLogin,handlers.responseHandle);
router.post('/add_roles',middleware.Auth,validators.addRoleValidator,userController.addUserRole,handlers.responseHandle);
router.get('/list_all_roles',middleware.Auth,userController.getUserRole,handlers.responseHandle);

module.exports = router;
 