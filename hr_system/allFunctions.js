const {
  PAGE_login,
  PAGE_logout,
  PAGE_my_inventory,
  PAGE_policy_documents,
  getAllPages,
  getAllActions,
} = require("./roles");

const jwt = require("jsonwebtoken");
const secret = require("./config.json");

const { Op, QueryTypes } = require("sequelize");
const db = require("./db");

let getPageById = async (id) => {
  let data;
  let all = await getAllPages();
  for (let item in all) {
    if (all[item].id == id) {
      data = all[item];
    }
  }
  // console.log(data);
  return data;
};

let getRolePages = async (roleid, models) => {
  let query = await models.RolesPage.findAll({
    where: { role_id: roleid },
  });
  // console.log(8989);
  // console.log(query.length);
  if (query.length > 0) {
    let data = await Promise.all(
      query.map(async (doc) => {
        doc = JSON.parse(JSON.stringify(doc));
        let obj = { ...doc };
        let page = await getPageById(doc.page_id);
        obj.page_name = page.name;
        return obj;
      })
    );
    // console.log(data);
    return data;
  }
};
let getActionById = async (id) => {
  let data;
  let all = await getAllActions();
  for (let item in all) {
    if (all[item].id == id) {
      data = all[item];
    }
  }
  return data;
};

let getRoleActions = async (roleid, models) => {
  let query = await models.RolesAction.findAll({
    where: { role_id: roleid },
  });
  let data;
  if (query.length > 0) {
    data = await Promise.all(
      query.map(async (doc) => {
        doc = JSON.parse(JSON.stringify(doc));
        let obj = { ...doc };
        let action = await getActionById(doc.action_id);
        obj.action_name = action.name;
        return obj;
      })
    );
    // console.log(4343);
    // console.log(data);
    return data;
  }
  // console.log(9090);
  // console.log(data);
};

// let getRoleNotifications = async (roleid, models) => {
//   let query =
//     await models.RolesNotification.findAll({
//       where: { role_id: roleid },
//     });
//   console.log(query);
//   if (query.length > 0) {
//     let getNotificationById = async (id) => {
//       let data;
//       let all = await getAllNotifications();
//       for (let item in all) {
//         if (all[item].id == id) {
//           // return item;
//           data = all[item];
//         }
//       }
//       return data;
//     };
//     let data = await Promise.all(
//       query.map(async (doc) => {
//         doc = JSON.parse(JSON.stringify(doc));
//         let obj = { ...doc };
//         let notification =
//           await getNotificationById(
//             doc.notification_id
//           );
//         obj.notification_name = notification.name;
//         return obj;
//       })
//     );
//     return data;
//   }
// };

let getRolePagesForSuperAdmin = async () => {
  let data = await getGenericPagesForAllRoles();
  // console.log(data);
  let allPages = await getAllPages();
  allPages.forEach((page) => {
    newPage = { page_id: page.id, page_name: page.name };
    data.push(newPage);
  });
  let sorted_Data = data.sort();
  // console.log(sorted_Data);
  return sorted_Data;
};

let getGenericPagesForAllRoles = async () => {
  let data = [];
  let allPages = await getAllPages();
  // console.log(123);
  for (let page in allPages) {
    let pid = allPages[page].id;
    if (
      pid == PAGE_login ||
      pid == PAGE_logout ||
      pid == PAGE_policy_documents ||
      pid == PAGE_my_inventory
    ) {
      let newPage = {
        page_id: allPages[page].id,
        page_name: allPages[page].name,
      };
      data.push(newPage);
    }
  }
  return data;
};

// let _getEmployeeProfilePhoto = async (profileInfo) => {
//   console.log(1);
//   let profileImage;
//   if (
//     profileInfo.slack_profile.profile.image_original != null
//   ) {
//     profileImage = profileInfo.slack_profile.image_original;
//   } else {
//     let uploadedImage;
//     if (profileInfo.image != null) {
//       uploadedImage = profileInfo.image;
//     }
//     if (uploadedImage != null) {
//       if (uploadedImage.indexOf("avatar.slack") !== false) {
//         profileImage = uploadedImage;
//       } else {
//         profileImage = `${process.env.BASEURL}backend/attendance/uploads/profileImages/${profileInfo["image"]}`;
//       }
//     }
//   }
//   return profileImage;
// };

let getUserInfo = async (userId, models) => {
  try {
    let users = await models.User.findOne({ where: { id: userId } });
    let user_profile = await models.UserProfile.findOne({
      where: { user_Id: users.id },
    });
    let user_roles = await models.UserRole.findOne({
      where: { user_id: users.id },
    });
    let roles = await models.Role.findOne({
      where: { id: user_roles.role_id },
    });
    let data = {};
    data.users = users;
    data.user_profile = user_profile;
    data.user_roles = user_roles;
    data.roles = roles;
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

let getUserInfoByWorkEmail = async (workEmailId, models) => {
  let userProfile = await models.UserProfile.findOne({
    where: { work_email: workEmailId },
  });
  console.log(userProfile);
  let user = await models.User.findOne({ where: { id: userProfile.user_Id } });
  console.log(234);
  console.log(user);
  let user_roles = await models.UserRole.findOne({
    where: { user_id: user.id },
  });
  let roles = await models.Role.findOne({
    where: { id: user_roles.role_id },
  });
  //  let userSlackInfo = getSlackUserInfo(workEmailId);
  let data = [];
  data.userProfile = userProfile;
  data.user = user;
  data.user_roles;
  data.roles = roles;
  //  data.slack_profile = userSlackInfo;
  return data;
};

let getRoleCompleteDetails = async (roleId, models) => {
  let data;
  let query = await models.Role.findAll({
    where: { id: roleId },
  });
  // query = JSON.parse(JSON.stringify(query));
  if (query.length > 0) {
    let role = [];
    role.role = query[0];
    let pages = await getRolePages(roleId, models);
    let actions = await getRoleActions(roleId, models);
    // let notification = await getRoleNotifications(
    //   roleId, models
    // );
    role.role_pages = pages;
    role.role_actions = actions;
    // role.role_notifications = notification;
    data = role;
  }
  return data;
};

let getUserRole = async (userId, models) => {
  let data;
  let userInfo = await getUserInfo(userId, models);
  if (userInfo.user_roles.role_id != null) {
    let roleCompleteDetails = await getRoleCompleteDetails(
      userInfo.user_roles.role_id,
      models
    );
    data = roleCompleteDetails;
  }
  return data;
};

let getRolePagesForApiToken = async (roleid, models) => {
  let data = await getGenericPagesForAllRoles();
  let rolesPages = await getRolePages(roleid, models);
  if (rolesPages != null) {
    rolesPages.forEach((rp) => {
      data.push(rp);
    });
  }
  let sorted_Data = data.sort();
  //   console.log(sorted_Data);
  return sorted_Data;
};

let checkifPageEnabled = async (page_id, models) => {
  let query = await models.RolesPage.findAll({
    where: {
      [Op.and]: [{ page_id: page_id }, { is_enabled: true }],
    },
  });
  if (query.length > 0) {
    return true;
  } else {
    return false;
  }
};

let getInventoriesRequestedForUnassign = async (models) => {
  let query = await models.MachineList.findAll(
    { attributes: [["id", "machine_id"]] },
    { where: { is_unassign_request: 1 } }
  );
  // console.log(query);
  return query;
};

let getInventoriesRequestedForOwnershipChange = async () => {
  let query = await models.MachineList.findAll(
    { attributes: [["id", "machine_id"]] },
    { where: { ownership_change_req_by_user: 1 } }
  );
  // console.log(query);
  return query;
};

let getUserInventories = async (userid, models, userRole = false) => {
  let data = false;
  let query = await models.MachineUser.findAll({ where: { user_Id: userid } });
  let roleName;
  if (userRole == false) {
    let roleDetails = await getUserRole(userid, models);
    if (roleDetails.role.name) {
      roleName = roleDetails.role.name;
    }
  } else {
    roleName = userRole;
  }
  if (
    roleName.toLowerCase() == "hr" ||
    roleName.toLowerCase() == "inventory manager"
  ) {
    // console.log(123213);
    let unassignRequestInventories = await getInventoriesRequestedForUnassign(
      models
    );
    query = query.concate(unassignRequestInventories);
    if (query.length > 1) {
      let tempExists = [];
      query.forEach((key) => {
        if (tempExists.includes(key.machine_id)) {
          key.pop();
        }
        tempExists.push(key.machine_id);
      });
    }
  }
  if (
    roleName.toLowerCase() == "hr" ||
    roleName.toLowerCase() == "inventory manager"
  ) {
    let ownershipChangeRequestInventories =
      await getInventoriesRequestedForOwnershipChange();
    query = query.concate(ownershipChangeRequestInventories);
    if (query.length > 1) {
      let tempExists = [];
      query.forEach((key) => {
        if (tempExists.includes(key.machine_id)) {
          key.pop();
        }
        tempExists.push(key.machine_id);
      });
    }
  }
  if (query.length == 0) {
  } else {
    data = query;
  }
  return data;
};

let getRolesForPage = async (page_id, models) => {
  let roles = [];
  let query = await models.RolesPage.findAll({ where: { page_id: page_id } });
  for (let ele in query) {
    let role = await getRoleCompleteDetails(query[ele].role_id, models);
    roles.push(role.role.name.toLowerCase());
  }
  return roles;
};
// ---------------------------not remains--------------------------------
let getInventoryComments = async (inventory_id, models) => {
  let row = {};
  let q1 = await models.InventoryCommentsModel.findAll({
    where: { inventory_id: inventory_id },
  });
  let q2 = await models.UserProfile.findAll({
    where: { user_id: q1.updated_by_user_id },
  });
  let q3 = await models.UserProfile.findAll({
    where: { user_id: q1.assign_unassign_user_id },
  });
  row.inventory_comments = q1;
  row.update_by_user = q2;
  row.assign_unassign_user_name = q3;
  return row;
};

let getInventoryHistory = async (inventory_id, models) => {
  let inventoryComments = await getInventoryComments(inventory_id, models);
  return inventoryComments;
};

let _getDateTimeData = async () => {
  let data = {};
  let currentTimeStamp = Math.floor(new Date().getTime() / 1000);
  data.current_timestamp = currentTimeStamp;
  data.current_date_number = new Date().getDate();
  data.current_month_number = new Date().getMonth() + 1;
  data.current_year_number = new Date().getFullYear();
  let date = new Date();
  data.todayDate_Y_m_d =
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  return data;
  // console.log(currentTimeStamp);
};

let getInvenoryAuditFullDetails = async (audit_id, models) => {
  let Return = {};
  let data = {};
  let q1 = await models.InventoryAuditMonthWise.findOne(
    { attributes: ["id", "inventory_id", "month", "year", "updated_at"] },
    { where: { id: audit_id } }
  );
  let q2 = await models.UserProfile.findOne(
    {
      attributes: [
        ["name", "audit_done_by_user_name"],
        ["work_email", "audit_done_by_user_email"],
      ],
    },
    { where: { user_Id: audit_done_by_user_id } }
  );
  let q3 = await models.InventoryCommentsModel.findOne(
    { attributes: [["comment", "audit_comment"], "comment_type"] },
    { where: { inventory_comment_id: q1.inventory_comment_id } }
  );
  data.inventory_audit_month_wise = q1;
  data.audit_done_by = q2;
  data.inventory_comments = q3;
  if (Object.keys(data).length == 0) {
  } else {
    Return = data;
  }
  return Return;
};

let getInventoryAuditStatusforYearMonth = async (
  inventory_id,
  year,
  month,
  models
) => {
  let data = false;
  let q = await models.InventoryAuditMonthWise.findAll({
    where: {
      [Op.and]: [
        { inventory_id: inventory_id },
        { year: year },
        { month: month },
      ],
    },
  });
  if (q.length == 0) {
  } else {
    let row = q[0];
    data = await getInvenoryAuditFullDetails(row.id, models);
  }
  return data;
};

let getInventoryFullDetails = async (
  id,
  hide_assigned_user_info = false,
  models
) => {
  let row = {};
  let query1 = await models.MachineList.findOne({ where: { id: id } });
  let query2 = await models.MachineUser.findOne(
    { attributes: ["user_Id", "assign_date"] },
    { where: { machine_id: query1.id } }
  );
  let query3 = await models.UserProfile.findOne(
    { attributes: ["name", "work_email"] },
    { where: { user_id: query2.user_id } }
  );
  let query4 = await models.FilesModel.findOne({
    where: { id: query1.file_inventory_invoice },
  });
  let query5 = await models.FilesModel.findOne({
    where: { id: query1.file_inventory_warranty },
  });
  let query6 = await models.FilesModel.findOne({
    where: { id: query1.file_inventory_photo },
  });
  row.machine_list = query1;
  row.machine_user = query2;
  row.user_profile = query3;
  row.file_inventory_invoice = query4;
  row.file_inventory_warranty = query5;
  row.file_inventory_photo = query6;
  let r_error = 0;
  let inventoryHistory = await getInventoryHistory(id, models);
  row.history = inventoryHistory;
  let assignedUserInfo = {};
  if (hide_assigned_user_info == false) {
    if (row.machine_user.user_Id != null) {
      let raw_assignedUserInfo = await getUserInfo(
        row.machine_user.user_Id,
        models
      );
      assignedUserInfo.name = raw_assignedUserInfo.name;
      assignedUserInfo.jobtitle = raw_assignedUserInfo.jobtitle;
      assignedUserInfo.work_email = raw_assignedUserInfo.work_email;
      // userProfileImage = await _getEmployeeProfilePhoto(raw_assignedUserInfo);
      // assignedUserInfo.profileImage = userProfileImage;
    }
  }
  row.assigned_user_info = assignedUserInfo;
  if (
    typeof row.machine_list.ownership_change_req_by_user != "undefined" &&
    row.machine_list.ownership_change_req_by_user * 1 > 0
  ) {
    let ownershipRequestedByUser = await getUserInfo(
      row.machine_list.ownership_change_req_by_user
    );
    if (typeof ownershipRequestedByUser.name !== "undefined") {
      row.ownership_change_req_by_user = ownershipRequestedByUser.name;
    }
  }
  let currentMonthAuditStatus = [];
  let dateTimeData = await _getDateTimeData();
  currentMonthAuditStatus.year = dateTimeData.current_year_number;
  currentMonthAuditStatus.month = dateTimeData.current_month_number;
  currentMonthAuditStatus.status = await getInventoryAuditStatusforYearMonth(
    id,
    dateTimeData.current_year_number,
    dateTimeData.current_month_number,
    models
  );
  row.audit_current_month_status = currentMonthAuditStatus;
  if (
    typeof row.file_inventory_invoice != "undefined" &&
    row.file_inventory_invoice != null
  ) {
    row.file_inventory_invoice = `${process.env.ENV_BASE_URL}.'attendance/uploads/inventories/'.${row.file_inventory_invoice}`;
  }
  if (
    typeof row.file_inventory_warranty != "undefined" &&
    row.file_inventory_warranty != null
  ) {
    row.file_inventory_warranty = `${process.env.ENV_BASE_URL}.'attendance/uploads/inventories/'.${row.file_inventory_warranty}`;
  }
  if (
    typeof row.file_inventory_photo != "undefined" &&
    row.file_inventory_photo != null
  ) {
    row.file_inventory_photo = `${process.env.ENV_BASE_URL}.'attendance/uploads/inventories/'.${row.file_inventory_photo}`;
  }
  return row;
};
// ------------------------------- not remanis--------------------------------

let isInventoryAuditPending = async (userid, models) => {
  let isAuditPending = false;
  let userInventories = await getUserInventories(userid, models);
  // console.log(userInventories);
  if (userInventories == false) {
  } else {
    let hide_assigned_user_info = true;
    for (let ele in userInventories) {
      let i_details = await getInventoryFullDetails(
        userInventories[ele].machine_id,
        hide_assigned_user_info,
        models
      );
      if (i_details.audit_current_month_status.status == null) {
        isAuditPending = true;
      }
    }
    return isAuditPending;
  }
};

let getUserPolicyDocument = async (userid, models) => {
  let r_error = 1;
  let r_message;
  let r_data = [];
  let q1 = await models.UserProfile.findOne({ where: { user_Id: userid } });
  let ar0 = JSON.parse(q1.policy_document);
  let q2 = await models.Config.findOne({ where: { type: "policy_document" } });
  let ar1 = JSON.parse(q2.value);
  let arr = [];
  if (ar0.length == 0) {
    for (let v2 in ar1) {
      ar1[v2].read = 0;
      let mandatory = 1;
      if (typeof ar1[v2].mandatory !== "undefined") {
        mandatory = ar1[v2].mandatory;
      }
      ar1[v2].mandatory = mandatory;
      arr.push(ar1[v2]);
    }
  }
  if (ar0.length != 0) {
    for (let v3 in ar1) {
      if (ar0.includes(ar1[v3].name)) {
        ar1[v3].read = 1;
        arr.push(ar1.v3);
      } else {
        ar1[v3].read = 1;
        arr.push(ar1[v3]);
      }
    }
  }
  r_error = 0;
  r_data = arr;
  let data = [];
  data.error = r_error;
  data.data = r_data;
  return data;
};

let is_policy_documents_read_by_user = async (userid, models) => {
  let data = true;
  let allDocumentsResult = await getUserPolicyDocument(userid, models);
  let allDocuments = allDocumentsResult.data;
  if (Array.isArray(allDocuments)) {
    for (let doc in allDocuments) {
      if (allDocuments[doc].read != 1 && allDocuments[doc].mandatory == 1) {
        data = false;
      }
    }
  }
  return data;
};

let isUnassignInventoriesRequestPending = async (models) => {
  let unassignRequestInventories = await getInventoriesRequestedForUnassign(
    models
  );
  if (unassignRequestInventories.length > 0) {
    return true;
  }
  return false;
};

let isOwnershipChangeInventoriesRequestPending = async (models) => {
  let ownershipChangeRequestInventories =
    await getInventoriesRequestedForOwnershipChange(models);
  if (ownershipChangeRequestInventories.length > 0) {
    return true;
  }
  return false;
};

let generateUserToken = async (userId, models) => {
  let userInfo = await getUserInfo(userId, models);
  if (userInfo == null) {
  } else {
    // let userProfileImage = await _getEmployeeProfilePhoto(userInfo);
    let userRole;
    if (userInfo.users.type.toLowerCase() == "admin") {
      userRole = userInfo.users.type;
    } else {
      let roleInfo = await getUserRole(userInfo.user_profile.user_Id, models);
      if (roleInfo != null) {
        userRole = roleInfo.role.name;
      }
    }
    u = {
      id: userInfo.user_profile.user_Id,
      username: userInfo.users.username,
      role: userRole,
      name: userInfo.user_profile.name,
      jobtitle: userInfo.user_profile.jobtitle,
      // profileImage : userProfileImage,
      login_time: new Date().getTime(),
      login_date_time: new Date(),
      // eth_token : userInfo.users.eth_token,
    };
    let roleAction = [];
    if (userInfo.users.type.toLowerCase() == "admin") {
      u.role_pages = await getRolePagesForSuperAdmin();
      // console.log(u.role_pages);
    } else {
      let roleInfo = await getUserRole(userInfo.user_profile.user_Id, models);
      if (roleInfo != null) {
        let role_pages = await getRolePagesForApiToken(
          roleInfo.role.id,
          models
        );
        for (let page in role_pages) {
          if (!checkifPageEnabled(role_pages[page].page_id, models)) {
            role_pages.page.pop();
          }
        }
        u.role_pages = role_pages;
      }
      if (roleInfo != null) {
        let role_actions = roleInfo.role_actions;
        // console.log(role_actions);
        role_actions.forEach((key) => {
          roleAction.push(key.action_name);
        });
      }
    }
    // console.log(roleAction);
    u.role_actions = roleAction;
    u.is_policy_documents_read_by_user = 1;
    u.is_inventory_audit_pending = 0;
    if (userInfo.users.type.toLowerCase() == "admin") {
      // console.log(2334234);
      if (isInventoryAuditPending(userInfo.users.id, models)) {
        let generic_pages = await getGenericPagesForAllRoles();
        u.right_to_skip_inventory_audit = 1;
        u.is_inventory_audit_pending = 1;
        generic_pages.forEach((ele) => {
          if (!checkifPageEnabled(ele.page_id, models)) {
            key.pop();
          }
        });
        // console.log(generic_pages);
        u.role_pages = generic_pages;
      }
      // let isValidGoogleDriveTokenExistsStatus = await isValidGoogleDriveTokenExists();
      // u.is_valid_google_drive_token_exists = isValidGoogleDriveTokenExistsStatus
      // console.log(u);
    } else {
      // console.log(123123);
      let generic_pages = await getGenericPagesForAllRoles();
      let is_policy_documents_read_by_user =
        await is_policy_documents_read_by_user(
          userInfo.user_profile.user_Id,
          models
        );
      if (is_policy_documents_read_by_user == false) {
        u.is_policy_documents_read_by_user = 0;
        generic_pages.forEach((ele) => {
          if (!checkifPageEnabled(ele.page_id, models)) {
            key.pop();
          }
        });
        u.role_pages = generic_pages;
      }
      let hasUnassignRequestInventories = false;
      let hasOwnershipChangeInventoriesRequestPending = false;
      if (userInfo.users.type.toLowerCase() == ("hr" || "inventory manager")) {
        hasUnassignRequestInventories =
          await isUnassignInventoriesRequestPending(models);
        hasOwnershipChangeInventoriesRequestPending =
          await isOwnershipChangeInventoriesRequestPending(models);
      }
      if (
        (await isInventoryAuditPending(userInfo.users.id, models)) ||
        hasUnassignRequestInventories ||
        hasOwnershipChangeInventoriesRequestPending
      ) {
        u.is_inventory_audit_pending = 1;
        generic_pages.forEach((ele) => {
          if (!checkifPageEnabled(ele.page_id, models)) {
            key.pop();
          }
        });
        if (
          addOns.skip_inventory_audit &&
          userInfo.users.type.toLowerCase() ==
            ("hr" || "inventory manager" || "hr payroll manager")
        ) {
        } else {
          u.role_pages = generic_pages;
        }
      }
      if (
        userInfo.users.type.toLowerCase() ==
        ("hr" || "inventory manager" || "hr payroll manager")
      ) {
        if (u.is_inventory_audit_pending == 1) {
          if (addOns.skip_inventory_audit) {
            u.is_inventory_audit_pending = 0;
          } else {
            u.right_to_skip_inventory_audit = 1;
          }
        }
      }
    }
    for (let ele in u.role_pages) {
      let roles = await getRolesForPage(u.role_pages[ele].page_id, models);
      u.role_pages[ele].roles = roles;
    }
    // console.log(u);
  }
  let token = jwt.sign({ data: u }, secret.jwtSecret, {
    expiresIn: "2hr",
  });
  // console.log(token);
  return token;
};

let copyExistingRoleRightsToNewRole = async (base_role_id, new_role_id) => {
  let baseRoleData = await getRoleCompleteDetails(base_role_id);
  if (baseRoleData != null && new_role_id != null) {
    if (
      typeof baseRoleData[role_pages] != undefined &&
      baseRoleData[role_pages].length > 0
    ) {
      let b_pages = baseRoleData[role_pages];
      for (let key in b_pages) {
        let b_page_id = b_pages[key].page_id;
        await addRolePage(new_role_id, b_page_id);
      }
    }
    if (
      typeof baseRoleData[role_actions] != undefined &&
      baseRoleData[role_actions].length > 0
    ) {
      let b_actions = baseRoleData.role_actions;
      for (let key in b_actions) {
        let b_action_id = b_action[key].action_id;
        await addRoleAction(new_role_id, b_action_id);
      }
    }
    if (
      typeof baseRoleData[role_notifications] != undefined &&
      baseRoleData[role_notifications].length > 0
    ) {
      let b_notifications = baseRoleData.role_notifications;
      for (let key in b_notifications) {
        let b_notification_id = b_notifications[key].notification_id;
        await addRoleNotification(new_role_id, b_notification_id);
      }
    }
  }
};

let assignDefaultValuesToRole = async (new_role_id, roleName = false) => {
  let allpages = await getAllPages();
  for (let key in allpages) {
    if (
      typeof allpages[key].baseCheck != undefined &&
      allpages[key].baseCheck == "defaultForAllRoles"
    ) {
      await addRolePage(new_role_id, allpages[key].id);
      if (
        typeof allpages[key].actions_list != undefined &&
        allpages[key].actions_list > 0
      ) {
        for (let ele in allpages[key].actions_list) {
          await addRoleAction(new_role_id, allpages[key].actions_list[ele].id);
        }
      }
    }
    if (roleName != false) {
      if (
        allpages[key].defaultForRoles != undefined &&
        allpages[key].defaultForRoles > 0 &&
        allpages[key].defaultForRoles.includes(roleName)
      ) {
        await addRolePage(new_role_id, allpages[key].id);
        if (
          typeof allpages[key].actions_list != undefined &&
          allpages[key].actions_list > 0
        ) {
          for (let ele in allpages[key].actions_list) {
            await addRoleAction(new_role_id, allpages[key].actions_list[ele]);
          }
        }
      }
    }
  }
};

let getAllRole = async (models) => {
  let q = await models.Role.findAll({});
  return q;
};

let manageUserTypeOnRoleChange = async (userid, models) => {
  let roleDetails = await getUserRole(userid, models);
  let currentRoleName = roleDetails.role.name;
  let q = await models.User.findOne({ where: { id: userid } });
  let userType = q.type;
  if (
    currentRoleName.toLowerCase() == "admin" &&
    userType.toLowerCase() == "admin"
  ) {
    let q = await models.User.update(
      { type: "admin" },
      { where: { id: userid } }
    );
  }
  if (
    currentRoleName.toLowerCase() != "admin" &&
    userType.toLowerCase() == "admin"
  ) {
    let q = await models.User.update(
      { type: "employee" },
      { where: { id: userid } }
    );
  }
  return true;
};

let isOnlyOneAdminRoleChanging = async (userid, models) => {
  let roleInfo = await getUserRole(userid, models);
  if (typeof roleInfo.name != undefined && roleInfo.name == "admin") {
    let q = await models.User.findAll({ where: { type: "admin" } });
    if (q.length == 1) {
      return true;
    }
  }
  return false;
};

let assignUserRole = async (userid, roleid, models) => {
  let error = 1;
  let message;
  if (await isOnlyOneAdminRoleChanging(userid, models)) {
    message = "Role cannot be change, as only one admin is left!!";
  } else {
    if (roleid == 0) {
      let q = await models.UserRole.destroy({ user_id: userid });
      error = 0;
      message = "User Role removed!!";
    } else {
      let q = await models.UserRole.findAll({ where: { user_id: userid } });
      if (q.length == 0) {
        let creation = await models.UserRole.create({
          user_id: userid,
          role_id: roleid,
        });
        error = 0;
        message = "User role assigned!!";
      } else {
        let q = await models.UserRole.update(
          { role_id: roleid },
          { where: { user_id: userid } }
        );
        error = 0;
        message = "User role updated!!";
      }
    }
    await manageUserTypeOnRoleChange(userid, models);
  }
  let Return = {
    error: error,
    message: message,
  };
  return Return;
};

let assignAdminRoleToUserTypeAdminIfNoRoleAssigned = async (roles, models) => {
  let q = await models.User.findAll({
    where: { [Op.and]: [{ type: "admin" }, { status: "Enabled" }] },
  });
  if (q.length > 0) {
    let adminRoleDetails = null;
    for (let key in roles) {
      if (roles[key].name == "admin") {
        adminRoleDetails = roles[key];
      }
    }
    if (adminRoleDetails != null) {
      for (let key in q) {
        let roleInfo = await getUserRole(q[key].id, models);
        if (
          roleInfo == null ||
          (typeof roleInfo.name != undefined && roleInfo.name != "admin")
        ) {
          await assignUserRole(q[key].id, adminRoleDetails.id, models);
        }
      }
    }
  }
};

let validateSecretKey = async (secret_key, models) => {
  let Return = false;
  let q = await models.SecretTokens.findOne({
    where: { secret_key: secret_key },
  });
  if (q.length > 0) {
    Return = true;
  }
  return Return;
};

let getEnabledUsersList = async (sorted_by = false, models) => {
  try {
    let q;
    let isAdmin;
    console.log(typeof isAdmin);
    if (sorted_by == "salary") {
      q = await models.sequelize.query(
        "SELECT users.*, user_profile.*,salary.total_salary,roles.id as role_id,roles.name as role_name FROM users LEFT JOIN user_profile ON users.id = user_profile.user_Id LEFT JOIN user_roles ON users.id = user_roles.user_id LEFT JOIN roles ON user_roles.role_id = roles.id LEFT JOIN ( SELECT user_Id, MAX(total_salary) as total_salary FROM salary GROUP BY user_Id ) as salary ON users.id = salary.user_Id where users.status = 'Enabled' ORDER BY salary.total_salary DESC",
        { type: QueryTypes.SELECT }
      );
    } else if (sorted_by == "dateofjoining") {
      q = await models.sequelize.query(
        "SELECT users.*, user_profile.*,roles.id as role_id,roles.name as role_name FROM users LEFT JOIN user_profile ON users.id = user_profile.user_Id LEFT JOIN user_roles ON users.id = user_roles.user_id LEFT JOIN roles ON user_roles.role_id = roles.id where users.status = 'Enabled' ORDER BY user_profile.dateofjoining ASC ",
        { type: QueryTypes.SELECT }
      );
    } else {
      console.log(8787);
      q = await models.sequelize.query(
        `SELECT users.*, user_profile.*,roles.id as role_id, roles.name as role_name FROM users LEFT JOIN user_profile ON users.id = user_profile."user_Id" LEFT JOIN user_roles ON users.id = user_roles.user_id LEFT JOIN roles ON user_roles.role_id = roles.id where users.status = 'Enabled' `,
        { type: QueryTypes.SELECT }
      );
    }
    console.log(q);
    let newRows = [];
    for (let pp in q) {
      delete q[pp].total_salary;
      if (isAdmin === null) {
        delete q[pp].holding_comments;
      }
      q[pp].slack_profile = [];
      newRows.push(q[pp]);
    }
    // console.log(newRows);
    // we have mker function related to slack user php code line no. 585 getSlackUsersList();
    // if(newRows.length>0){
    //  for(let key in newRow
    //     newRows[key][profileImage] = await _getEmployeeProfilePhoto(newRows[key].profileImage.values());
    //   }
    // }
    return newRows;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
let getEnabledUsersListWithoutPass = async (
  role = false,
  sorted_by = false,
  models
) => {
  let row = await getEnabledUsersList(sorted_by, models);
  let rows = [];
  let secureKeys = [
    "bank_account_num",
    "blood_group",
    "address1",
    "address2",
    "emergency_ph1",
    "emergency_ph2",
    "medical_condition",
    "dob",
    "marital_status",
    "city",
    "state",
    "zip_postal",
    "country",
    "home_ph",
    "mobile_ph",
    "work_email",
    "other_email",
    "special_instructions",
    "pan_card_num",
    "permanent_address",
    "current_address",
    "slack_id",
    "policy_document",
    "training_completion_date",
    "termination_date",
    "training_month",
    "slack_msg",
    "signature",
    "role_id",
    "role_name",
    "eth_token",
  ];
  for (let val in row) {
    delete row[val].password;
    if (role.toLowerCase() == "guest") {
      for (let key in val) {
        for (let secureKey in secureKeys) {
          if (val[key] == secureKeys[secureKey]) {
            delete val[key];
          }
        }
      }
    }
    rows.push(row[val]);
  }
  // let Return = {
  //   error: 0,
  //   data: rows,
  // };
  // // console.log(231);
  return rows;
};

module.exports = {
  getEnabledUsersListWithoutPass,
  validateSecretKey,
  assignUserRole,
  getAllRole,
  getRolePagesForSuperAdmin,
  getGenericPagesForAllRoles,
  getRolePages,
  getRolesForPage,
  getRoleActions,
  //   getRoleNotifications,
  //   _getEmployeeProfilePhoto
  getUserInfo,
  getUserInfoByWorkEmail,
  getUserRole,
  getRolePagesForApiToken,
  checkifPageEnabled,
  isInventoryAuditPending,
  isUnassignInventoriesRequestPending,
  is_policy_documents_read_by_user,
  isOwnershipChangeInventoriesRequestPending,
  generateUserToken,
  copyExistingRoleRightsToNewRole,
  assignDefaultValuesToRole,
  assignAdminRoleToUserTypeAdminIfNoRoleAssigned,
}