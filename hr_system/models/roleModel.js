const { copyExistingRoleRightsToNewRole,assignDefaultValuesToRole } = require("../allFunctions");
const { getAllPages, getAllActions, getAllNotifications } = require("../roles");
const {getRolePages,getRoleActions, getAllRole, assignAdminRoleToUserTypeAdminIfNoRoleAssigned} = require("../allFunctions");
function roles(database, type) {
  const roles = database.define("roles", {
    name: type.STRING,
    description: type.STRING,
    last_update: type.DATE,
  });

  roles.AddNewRole = async (name, description, base_role_id = false, res) => {
    try {
      let error = 1;
      let message;
      let q = await roles.findAll({ where: { name: name } });
      if (q.length == 0) {
        let creation = await roles.create({
          name: name,
          description: description,
        });
        error = 0;
        message = "New role added";
        if (base_role_id != null) {
          // q = await roles.findAll({where:{name: name}});
          for (let key in q) {
            if (q.length != null && typeof q[key].id != undefined) {
              let qId = q[key].id;
              await copyExistingRoleRightsToNewRole(base_role_id, qId);
            }
          }
        } else {
          for (let key in q) {
            if (q.length != null && typeof q[key].id != undefined) {
              let qId = q[key].id;
              await assignDefaultValuesToRole(qId, name);
            }
          }
        }
      } else {
        error = 1;
        message = "Role name already exist";
        // return "not updated";
      }
      let arr = {};
      arr.error = error;
      arr.message = message;
      return arr;
    } catch (error) {
      throw new Error(error);
    }
  };

  roles.listAllRole = async (models) => {
    try {
      let result = {};
      let allpages = await getAllPages();
      let allactions = await getAllActions();
      let allnotifications = await getAllNotifications();
      result.default_pages = allpages;
      result.default_actions = allactions;
      result.default_notifications = allnotifications;
      let array = await getAllRole(models);
      let array2 = [];
      if(array.length > 0){
        await assignAdminRoleToUserTypeAdminIfNoRoleAssigned(array,models);
        for(let key of array){
          let role_page = await getRolePages(key.id, models);
          let role_action = await getRoleActions(key.id, models);
          // let role_notify = await getRoleNotifications(array[key].id);
          for(const v1 of allpages){
            let p = 0;
            for(let u1 in role_page){
              if(role_page[u1].page_id == v1.id){
                p = 1;
              }
            }
            v1.is_assigned = p;
            let updatedActionsList = [];
            if(typeof v1.actions_list != undefined){
              updatedActionsList = v1.actions_list;
              for(let key of updatedActionsList){
                let is_assigned = 0;
                for(let u2 of role_action){
                  if(u2.action_id == key.id){
                    is_assigned = 1;
                  }
                }
                key.is_assigned = is_assigned;
                updatedActionsList = updatedActionsList[key];
              }
            }
            // console.log(updatedActionsList);/
            v1.actions_list = updatedActionsList;
            // console.log(v1);
            console.log(key);
            key.push(v1);
          }
          for(let v2 in allactions){
            let p=0;
            for(let u2 in role_action){
              if(role_action[u2].action_id == allactions[v2].id){
                p1 = 1;
              }
            }
            allactions[v2].is_assigned = p;
            array[key].role_action = allactions[v2];
          }
          // --------start from here
        }
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
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
