const { check } = require("express-validator");

const userCreationValidator = [
  check("email", "email must not be empty").not().isEmpty(),
  check("username", "username must not be empty").not().isEmpty(),
  check("city", "city must not be empty").not().isEmpty(),
  check("state", "state must not be empty").not().isEmpty(),
];

const userLoginValidator = [
  check("email", "email must not be empty").not().isEmpty(),
  check("username", "username must not be empty").not().isEmpty(),
];

const machineCreationValidator = [
  check("machine_type", "machine_type must not be empty").not().isEmpty(),
  check("machine_name", "machine_name must not be empty").not().isEmpty(),
  check("serial_no", "serial_no must not be empty").not().isEmpty(),
  check("status", "status must not be empty").not().isEmpty(),
];

const inventoryAuditValidator = [
  check("inventory_id", "inventory_id must not be empty").not().isEmpty(),
//   check("audit_message", "audit_message must not be empty").not().isEmpty(),
];

module.exports = {
  userCreationValidator,
  userLoginValidator,
  machineCreationValidator,
  inventoryAuditValidator,
};
