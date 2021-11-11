function UserRole(database, type) {
  const userRole = database.define("user_roles", {
    user_id: type.INTEGER,
    role_id: type.INTEGER,
  });
//   userRole.assignUserRole = async (userId, roleId) => {
//     try {
//       let roleToassign = await userRole.create({
//         user_id: userId,
//         role_id: roleId,
//       });
//       return roleToassign.id;
//     } catch (error) {
//       throw new Error(error);
//     }
//   };
  return userRole;
}

module.exports = UserRole;
