function UserRole(database, type) {
  const userRole = database.define("user_roles", {
    user_id: type.INTEGER,
    role_id: type.INTEGER,
  });
  userRole.assignRole = async (reqBody) => {
    try {
      let roleToassign = await userRole.create({
        user_id: reqBody.user_id,
        role_id: reqBody.role_id,
      });
      return roleToassign.id;
    } catch (error) {
      throw new Error(error);
    }
  };
  return userRole;
}

module.exports = UserRole;
