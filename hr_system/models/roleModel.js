function roles(database, type) {
  const roles = database.define("roles", {
    name: type.STRING,
    description: type.STRING,
    last_update: type.DATE,
  });

  roles.AddUserRole = async (reqBody) => {
    try {
      let foundRoles = await roles.findAll({where: {name: reqBody.name}});
      if(!foundRoles){
        let creation = await roles.create({
          name: reqBody.name,
          description: reqBody.description,
        });
      }else{
        
      }
      
      return creation.id;
    } catch (error) {
      throw new Error(error);
    }
  };

  roles.getUserRoles = async (limit, offset) => {
    try {
      let all_machine = await roles.findAll({ limit, offset });
      return all_machine;
    } catch (error) {
      throw new Error("Unable to locate all users");
    }
  };

  roles.updateRole = async (reqBody, models) => {
    try {
      let updated_Role = await roles.findOne({
        where: { id: reqBody.role_id },
      });
      if (updated_Role) {
        let roleAction = await models.RolesAction.create({
          role_id: reqBody.role_id,
          action_id: reqBody.action_id,
        });
        let rolePage = await models.RolesPage.create({
          role_id: reqBody.role_id,
          page_id: reqBody.page_id,
        });
        let roleNotification = await models.RolesNotification.create({
          role_id: reqBody.role_id,
          notification_id: reqBody.notification_id,
        });
        return "updated";
      } else {
        return "not updated";
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  roles.getListOfRoles = async () => {
    try {
      let list = await roles.findAll({});
      return list;
    } catch (error) {
      throw new Error(error);
    }
  };
  roles.deleteRole = async (reqBody) => {
    try {
      let roletoDelete = await roles.destroy({
        where: { id: reqBody.role_id },
      });
      console.log(roletoDelete);
      if (roletoDelete == 1) {
        return "deleted";
      } else {
        return "not deleted";
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  return roles;
}

module.exports = roles;
