const db = require("../db");
const {
  getUserInventories,
  getUserRole,
  getInventoryFullDetails,
  is_policy_documents_read_by_user,
  getUserInfo,
  refreshToken,
  getInventoryHistory,
  addInventoryComment,
  assignUserMachine,
} = require("../allFunctions");
const { Op } = require("sequelize");
function machinelist(database, type) {
  const MachineList = database.define(
    "machines_list",
    {
      machine_type: {
        type: type.STRING,
        defaultValue: null,
      },
      machine_name: {
        type: type.STRING,
        defaultValue: null,
      },
      machine_price: {
        type: type.STRING,
        defaultValue: null,
      },
      serial_number: {
        type: type.STRING,
        defaultValue: 0,
      },
      date_of_purchase: {
        type: type.DATE,
        defaultValue: null,
      },
      mac_address: {
        type: type.STRING,
        defaultValue: 0,
      },
      operating_system: {
        type: type.STRING,
        defaultValue: null,
      },
      status: {
        type: type.STRING,
        defaultValue: null,
      },
      comments: {
        type: type.STRING,
        defaultValue: null,
      },
      warranty_end_date: {
        type: type.DATE,
        defaultValue: null,
      },
      bill_number: {
        type: type.STRING,
        defaultValue: 0,
      },
      warranty_comment: {
        type: type.STRING,
        defaultValue: null,
      },
      repair_comment: {
        type: type.STRING,
        defaultValue: null,
      },
      file_inventory_invoice: {
        type: type.INTEGER,
        defaultValue: null,
      },
      file_inventory_warranty: {
        type: type.INTEGER,
        defaultValue: null,
      },
      file_inventory_photo: {
        type: type.INTEGER,
        defaultValue: null,
      },
      warranty_years: {
        type: type.STRING,
        defaultValue: null,
      },
      approval_status: {
        type: type.INTEGER,
        // defaultValue: null
      },
      is_unassign_request: {
        type: type.INTEGER,
        defaultValue: null,
      },
      ownership_change_req_by_user: {
        type: type.INTEGER,
        // defaultValue: null
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );
  MachineList.associate = (models) => {
    models.MachineList.hasOne(models.FilesModel, {
      foreignKey: "file_inventory_invoice",
      as: "file_inventory_invoice_id",
    });
    models.MachineList.hasOne(models.FilesModel, {
      foreignKey: "file_inventory_warranty",
      as: "file_inventory_warranty_id",
    });
    models.MachineList.hasOne(models.FilesModel, {
      foreignKey: "file_inventory_photo",
      as: "file_inventory_photo_id",
    });
  };

  MachineList.addOfficeMachine = async (req, db) => {
    try {
      const loggeduserid = req.userData.data.id;
      let creation = await MachineList.create({
        machine_type: req.body.machine_type,
        machine_name: req.body.machine_name,
        machine_price: req.body.machine_price,
        serial_number: req.body.serial_number,
        date_of_purchase: req.body.date_of_purchase,
        mac_address: req.body.mac_address,
        operating_system: req.body.operating_system,
        status: req.body.status,
        comments: req.body.unassign_comment,
        warranty_end_date: req.body.warranty_end_date,
        bill_number: req.body.bill_number,
        warranty_comment: req.body.warranty_comment,
        repair_comment: req.body.repair_comment,
        file_inventory_invoice: req.body.file_inventory_invoice,
        file_inventory_warranty: req.body.file_inventory_warranty,
        file_inventory_photo: req.body.temp_inventory_photo,
        warranty_years: req.body.warranty_years,
        approval_status: req.body.approval_status,
        is_unassign_request: req.body.is_unassign_request,
        ownership_change_req_by_user: req.body.ownership_change_req_by_user,
      });
      console.log(creation.machine_type);
      if (creation.id != null) {
        const machine_id = creation.id;
        if (req.body.user_id === "" || req.body.user_id == null) {
          if (req.body.unassign_comments != null) {
            const addInventoryComment1 = await addInventoryComment(
              creation.id,
              loggeduserid,
              db,
              req
            );
          } else {
            console.log("unassign comment is empty");
          }
        } else {
          const assign = await assignUserMachine(
            machine_id,
            req.body.user_id,
            loggeduserid,
            req,
            db
          );
        }
        await updateInventoryWithTempFile(
          loggeduserid,
          machine_id,
          db,
          req,
          req.body.user_id
        );
      } else {
        console.log("Error in adding new inventory");
      }
      return creation.id;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  MachineList.getAll = async (limit, offset) => {
    try {
      let all_machine = await MachineList.findAll({ limit, offset });
      return all_machine;
    } catch (error) {
      throw new Error("Unable to locate all users");
    }
  };
  // MachineList.GetMachine = async (reqBody, models) => {
  //   try {
  //     const loggeduserid = reqBody.userData.data.id;
  //     const loggeduser_role = reqBody.userData.data.role;
  //     let res = await api_getMyInventories(
  //       loggeduserid,
  //       loggeduser_role,
  //       models
  //     );
  //     if (
  //       typeof reqBody.body.skip_inventory_audit != undefined &&
  //       reqBody.body.skip_inventory_audit == 1
  //     ) {
  //       let lowerCaseLoggedUserRole = loggeduser_role.toLowerCase();
  //       if (
  //         lowerCaseLoggedUserRole == "hr" ||
  //         lowerCaseLoggedUserRole == "inventory manager" ||
  //         lowerCaseLoggedUserRole == "hr payroll manager" ||
  //         lowerCaseLoggedUserRole == "admin"
  //       ) {
  //         let addOnsRefreshToken = [];
  //         addOnsRefreshToken.skip_inventory_audit = true;
  //         let newToken = await refreshToken(
  //           reqBody.headers.authorization,
  //           models,
  //           addOnsRefreshToken
  //         );
  //         res.data.new_token = newToken;
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     throw new Error("Unable to locate all users");
  //   }
  // };

  // MachineList.getMachineDetail = async (reqBody,models, res) => {
  //   try {
  //     let error = 0;
  //     let row = {};
  //     let query1 = await models.MachineList.findOne({ where: { id: reqBody.id } });
  //     let query2 = await models.MachineUser.findOne(
  //       { attributes: ["user_Id", "assign_date"] },
  //       { where: { machine_id: query1.id } }
  //     );
  //     let query3 = await models.FilesModel.findOne({
  //       where: { id: query1.file_inventory_invoice },
  //     });
  //     let query4 = await models.FilesModel.findOne({
  //       where: { id: query1.file_inventory_warranty },
  //     });
  //     let query5 = await models.FilesModel.findOne({
  //       where: { id: query1.file_inventory_photo },
  //     });
  //     row.machine_list = query1;
  //     row.machine_user = query2;
  //     row.file_inventory_invoice = query3;
  //     row.file_inventory_warranty = query4;
  //     row.file_inventory_photo = query5;
  //     // let all_machine = await MachineList.findOne({
  //     //   where: { id: reqBody.id },
  //     //   include: [
  //     //     {
  //     //       model: db.FilesModel,
  //     //       as: "file_inventory_invoice_id",
  //     //     },
  //     //     {
  //     //       model: db.FilesModel,
  //     //       as: "file_inventory_warranty_id",
  //     //     },
  //     //     {
  //     //       model: db.FilesModel,
  //     //       as: "file_inventory_photo_id",
  //     //     },
  //     //   ],
  //     // });
  //     // res.send(all_machine);

  //     // let userProfiledata = await db.UserProfile.findAll({
  //     //   where: { id: inventory_comments.assign_unassign_user_id },
  //     // });
  //     // return all_machine;
  //     const inventoryHistory = await getInventoryHistory(reqBody.id, models);
  //     row.history = inventoryHistory;
  //     let Return = {};
  //     Return.error=error;
  //     Return.data = row;
  //     return Return;
  //   } catch (error) {
  //     console.log(error);
  //     throw new Error("Unable to locate all users");
  //   }
  // };
  MachineList.updateMachine = async (reqBody) => {
    try {
      let update = await MachineList.update(
        {
          machine_type: reqBody.machine_type,
          machine_name: reqBody.machine_name,
          machine_price: reqBody.machine_price,
          serial_number: reqBody.serial_number,
          date_of_purchase: reqBody.date_of_purchase,
          mac_address: reqBody.mac_address,
          operating_system: reqBody.operating_system,
          status: reqBody.status,
          comments: reqBody.unassign_comment,
          warranty_end_date: reqBody.warranty_end_date,
          bill_number: reqBody.bill_number,
          warranty_comment: reqBody.warranty_comment,
          repair_comment: reqBody.repair_comment,
          file_inventory_invoice: reqBody.file_inventory_invoice,
          file_inventory_warranty: reqBody.file_inventory_warranty,
          file_inventory_photo: reqBody.temp_inventory_photo,
          warranty_years: reqBody.warranty_years,
          approval_status: reqBody.approval_status,
          is_unassign_request: reqBody.is_unassign_request,
          ownership_change_req_by_user: reqBody.ownership_change_req_by_user,
        },
        { where: { id: reqBody.id } }
      );
      return update;
    } catch (error) {
      throw new Error(error);
    }
  };
  // MachineList.getMachineCount = async () => {
  //   try {
  //     let machine_count = await MachineList.count();
  //     return machine_count;
  //   } catch (error) {
  //     throw new Error("Unable to locate all machine count");
  //   }
  // };

  MachineList.removeMachine = async (reqBody) => {
    try {
      let machineToRemove = await MachineList.destroy({
        where: { id: reqBody.id },
      });
      return machineToRemove;
    } catch (error) {
      throw new Error(error);
    }
  };
  let getInventoryComments = async (inventory_id, db) => {
    try {
      let inventory_comments = await db.InventoryCommentsModel.findAll({
        where: { inventory_id: inventory_id },
      });
      let userProfileData = [];
      inventory_comments.forEach(async (comments) => {
        let ProfileData = await db.UserProfile.findAll({
          where: {
            [Op.or]: [
              { id: comments.updated_by_user_id },
              { id: comments.assign_unassign_user_id },
            ],
          },
        });
        userProfileData.push(ProfileData);
      });
      const Result = [];
      Result.comments = inventory_comments;
      Result.userProfileData = userProfileData;
      return Result;
    } catch (error) {
      console.log(error);
      throw new Error("error in  getInventoryComments");
    }
  };
  // let addInventoryComment = async (machine_id, loggeduserid, req, db) => {
  //   const inventoryComment = await db.InventoryCommentsModel.create({
  //     inventory_id: machine_id,
  //     updated_by_user_id: loggeduserid,
  //     comment_type: req.body.comment_type,
  //     comment: req.body.unassign_comment,
  //   });
  //   if (req.body.assign_unassign_user_id != null) {
  //     const inventoryComment = await db.InventoryCommentsModel.create({
  //       inventory_id: machine_id,
  //       updated_by_user_id: loggeduserid,
  //       comment_type: req.body.comment_type,
  //       comment: req.body.unassign_comment,
  //       assign_unassign_user_id: req.body.assign_unassign_user_id,
  //     });
  //   }
  //   return inventoryComment.id;
  // };
  // MachineList. assignUserMachine = async (machine_id, req, loggeduserid) => {
  //   try{
  //   let r_error=1;
  //   let r_message="";
  //   if (
  //     req.body.userid == "" ||
  //     req.body.userid == 0 ||
  //     req.body.userid == null
  //   ) {
  //     await removeMachineAssignToUser(machine_id, loggeduserid, req);
  //   } else {
  //     const machine_info = await getMachineDetails(machine_id);
  //     let checkpass = true;
  //     if (typeof machine_info.status!="undefined" && machine_info.status == "sold") {
  //       checkpass = false;
  //       r_error=1;
  //       message = "Sold status inventory cannnot be assign to any employee";
  //     }
  //     if(checkpass==true){
  //       let date=new Date().toISOString().slice(0, 10)

  //       console.log(today)
  //     }
  //   }
  // }catch(error){
  //   console.log(error)
  // }
  // };
  const updateInventoryWithTempFile = async (
    loggeduserid,
    machine_id,
    db,
    req
  ) => {
    const file_id = await db.InventoryTempFiles.findOne({
      where: { id: req.body.temp_inventory_photo_id },
    });
    await updateInventoryFilePhoto(loggeduserid, machine_id, file_id, db, req);
  };
  const updateInventoryFilePhoto = async (
    loggeduserid,
    machine_id,
    file_id,
    db,
    req
  ) => {
    await db.MachineList.update(
      { file_inventory_photo: file_id },
      { where: { id: machine_id } }
    );
    await addInventoryComment(machine_id, loggeduserid, db, req);
  };
  const removeMachineAssignToUser = async (machine_id, loggeduserid, req) => {
    const machine_Info = await getMachineDetail(machine_id);
    if (machine_Info != null) {
      const message = [];
      message.inventoryName = machine_Info.machine_name;
      message.invetoryType = machine_Info.machine_type;
      addInventoryComment(machine_id, loggeduserid, req, db);
    }
    await db.MachineUser.destroy({ where: { machine_id: machine_id } });
    return message;
  };

  return MachineList;
}
module.exports = machinelist;
