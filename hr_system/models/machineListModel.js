const { MachineList } = require(".");
const db = require("../db");

function machinelist(database, type) {
  const { Op } = require("sequelize");
  const MachineList = database.define(
    "machinelist",
    {
      machine_type: type.STRING,
      machine_name: type.STRING,
      machine_price: type.STRING,
      serial_number: type.STRING,
      date_of_purchase: type.DATE,
      mac_address: type.STRING,
      operating_system: type.STRING,
      status: type.STRING,
      comments: type.STRING,
      warranty_end_date: type.DATE,
      bill_number: type.STRING,
      warranty_comment: type.STRING,
      repair_comment: type.STRING,
      file_inventory_invoice: type.INTEGER,
      file_inventory_warranty: type.INTEGER,
      file_inventory_photo: type.INTEGER,
      warranty_years: type.STRING,
      approval_status: type.INTEGER,
      is_unassign_request: type.INTEGER,
      ownership_change_req_by_user: type.INTEGER,
    },
    {
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
      const loggeduserid = req.userData.user_id;
      if (req.mac_address != null || req.body.serial_number != null) {
        var Data = await MachineList.findOne({
          where: {
            [Op.or]: [
              { mac_address: req.body.mac_address },
              { serial_number: req.body.serial_number },
            ],
          },
        });
      }
      if (Data == null) {
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
        if (creation.id != null) {
          const machine_id = creation.id;
          if (req.body.user_id == "" || req.body.user_id == null) {
            if (req.body.unassign_comments != null) {
              const addInventoryComment1 = await addInventoryComment(
                creation.id,
                loggeduserid,
                req
              );
            }
            else{console.log("unassign comment is empty")}
          } else {
            const assign = await assignUserMachine(
              machine_id,
              req,
              loggeduserid
            );
          }
          await updateInventoryWithTempFile(
            loggeduserid,
            machine_id,
            db,
            req
          );
        } else {
          console.log("Error in adding new inventory");
        }
        return creation.id;
      } else {
        console.log("mac_address or serial_no already exists");
      }
    } catch (error) {
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

  MachineList.GetMachine = async (reqBody, models) => {
    try {
      let machine_ids = await models.MachineUser.findAll({
        where: {
          user_Id: reqBody.userData.user_id.id,
        },
        attributes: ["id"],
      });
      machine_ids = machine_ids.map((doc) => doc.id);
      let all_machine = await MachineList.findAll({
        where: {
          id: machine_ids,
        },
      });
      return all_machine;
    } catch (error) {
      throw new Error("Unable to locate all users");
    }
  };

  MachineList.getMachineDetail = async (reqBody, db, res) => {
    try {
      let all_machine = await MachineList.findOne({
        where: { id: reqBody.id },
        include: [
          {
            model: db.FilesModel,
            as: "file_inventory_invoice_id",
          },
          {
            model: db.FilesModel,
            as: "file_inventory_warranty_id",
          },
          {
            model: db.FilesModel,
            as: "file_inventory_photo_id",
          },
        ],
      });
      // res.send(all_machine);

      // let userProfiledata = await db.UserProfile.findAll({
      //   where: { id: inventory_comments.assign_unassign_user_id },
      // });
      // return all_machine;
      // console.log(all_machine)
      const inventoryHistory = await getInventoryHistory(reqBody.id, db);
      return inventoryHistory;
    } catch (error) {
      throw new Error("Unable to locate all users");
    }
  };
  MachineList.updateMachine = async (reqBody) => {
    try {
      // let machine_to_update = await MachineList.findAll({
      //   where: { id: reqBody.id },
      // });
      // if (machine_to_update) {
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
      // } else {
      //   throw new Error("Unable to find machine with the given id");
      // }
    } catch (error) {
      throw new Error(error);
    }
  };

  MachineList.getUnassignedInventory = async (reqBody, models) => {
    try {
      let machineWithUser = await models.MachineUser.findAll({});
      let machineWithUserIds = machineWithUser.map((doc) => doc.machine_id);
      let unassignedInventory = await MachineList.findAll({
        where: { id: { [Op.notIn]: machineWithUserIds } },
      });
      return unassignedInventory;
    } catch (error) {
      throw new Error(error);
    }
  };

  MachineList.getMachineCount = async () => {
    try {
      let machine_count = await MachineList.count();
      return machine_count;
    } catch (error) {
      throw new Error("Unable to locate all machine count");
    }
  };

  MachineList.getMachinesDetail = async () => {
    try {
      let machinesDetail = await MachineList.findAll({});
      return machinesDetail;
    } catch (error) {
      throw new Error(error);
    }
  };
  MachineList.getUnapprovedInventory = async () => {
    try {
      let unapprovedInventory = await MachineList.findAll({
        where: { approval_status: 0 },
      });
      return unapprovedInventory;
    } catch (error) {
      throw new Error(error);
    }
  };
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
      console.log(Result);
      return Result;
    } catch (error) {
      console.log(error);
      throw new Error("error in  getInventoryComments");
    }
  };
  let getInventoryHistory = async (inventory_id, db) => {
    try {
      const inventoryHistory = await getInventoryComments(inventory_id, db);
      return inventoryHistory;
    } catch (error) {
      throw new Error("error in getInventoryHistory");
    }
  };
  return MachineList;
}
let addInventoryComment = async (machine_id, loggeduserid, req,db) => {
  const inventoryComment = await db.InventoryCommentsModel.create({
    inventory_id: machine_id,
    updated_by_user_id: loggeduserid,
    comment_type: req.body.comment_type,
    comment: req.body.unassign_comment,
  });
  if (req.body.assign_unassign_user_id != null) {
    const inventoryComment = await db.InventoryCommentsModel.create({
      inventory_id: machine_id,
      updated_by_user_id: loggeduserid,
      comment_type: req.body.comment_type,
      comment: req.body.unassign_comment,
      assign_unassign_user_id: req.body.assign_unassign_user_id,
    });
  }
  return inventoryComment.id;
};
const assignUserMachine = async (machine_id, req, loggeduserid) => {
  if (
    req.body.userid == "" ||
    req.body.userid == 0 ||
    req.body.userid == null) {
      await removeMachineAssignToUser(machine_id,loggeduserid,req);
  }
  else{
    const machine_info =await getMachineDetails(machine_id)
    let checkpass=true;
    if(machine_info.status=="sold"){
    checkpass=false;
      message = "Sold status inventory cannnot be assign to any employee";
    } 
  }
};
const updateInventoryWithTempFile = async (
  loggeduserid,
  machine_id,
  db, req
) => {
  const file_id = await db.InventoryTempFiles.findOne({
    where: { id: req.body.temp_inventory_photo_id },
  });
  await updateInventoryFilePhoto(loggeduserid, machine_id, file_id,db,req);
};
const updateInventoryFilePhoto = async (
  loggeduserid,
  machine_id,
  file_id,
  db,req
) => {
  await db.MachineList.update(
    { file_inventory_photo: file_id },
    {where:{ id: machine_id }}
  );
  await addInventoryComment(machine_id, loggeduserid, req,db);
};
const removeMachineAssignToUser = async (machine_id, loggeduserid,req) => {
const machine_Info = await getMachineDetail(machine_id);
if(machine_Info!=null){
  const message=[];
  message.inventoryName=machine_Info.machine_name;
  message.invetoryType=machine_Info.machine_type;
  addInventoryComment(machine_id,loggeduserid,req,db)
}
await db.MachineUser.destroy({where:{machine_id:machine_id}})
    return message;
    };
module.exports = machinelist;
