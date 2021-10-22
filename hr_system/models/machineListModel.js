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
      timestamps: true,
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

  MachineList.createMachine = async (reqBody) => {
    try {
      let creation = await MachineList.create({
        machine_type: reqBody.machine_type,
        machine_name: reqBody.machine_name,
        machine_price: reqBody.machine_price,
        serial_number: reqBody.serial_number,
        date_of_purchase: reqBody.date_of_purchase,
        mac_address: reqBody.mac_address,
        operating_system: reqBody.operating_system,
        status: reqBody.status,
        comments: reqBody.comments,
        warranty_end_date: reqBody.warranty_end_date,
        bill_number: reqBody.bill_number,
        warranty_comment: reqBody.warranty_comment,
        repair_comment: reqBody.repair_comment,
        file_inventory_invoice: reqBody.file_inventory_invoice,
        file_inventory_warranty: reqBody.file_inventory_warranty,
        file_inventory_photo: reqBody.file_inventory_photo,
        warranty_years: reqBody.warranty_years,
        approval_status: reqBody.approval_status,
        is_unassign_request: reqBody.is_unassign_request,
        ownership_change_req_by_user: reqBody.ownership_change_req_by_user,
      });
      return creation.id;
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

  MachineList.GetMachineById = async (reqBody, res) => {
    try {
      let all_machine = await MachineList.findAll({
        where: {
          id: reqBody.id,
        },
      });
      return all_machine;
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
          comments: reqBody.comments,
          warranty_end_date: reqBody.warranty_end_date,
          bill_number: reqBody.bill_number,
          warranty_comment: reqBody.warranty_comment,
          repair_comment: reqBody.repair_comment,
          file_inventory_invoice: reqBody.file_inventory_invoice,
          file_inventory_warranty: reqBody.file_inventory_warranty,
          file_inventory_photo: reqBody.file_inventory_photo,
          warranty_years: reqBody.warranty_years,
          approval_status: reqBody.approval_status,
          is_unassign_request: reqBody.is_unassign_request,
          ownership_change_req_by_user: reqBody.ownership_change_req_by_user,
        },
        { where: { id: reqBody.id } }
      );
      // console.log(update);
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
      // let unassignedArray = [];
      if (machineWithUser) {
        let machineWithUserIds = machineWithUser.map((doc) => doc.machine_id);
        console.log(machineWithUserIds);
        let unassignedInventory = await MachineList.findAll({
          where: { id: { [Op.notIn]: machineWithUserIds } },
        });
        // unassignedArray.push(unassignedInventory);
        // });
        // console.log(unassignedArray);
        return unassignedInventory;
      } else {
        return "nothing found";
      }
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
  return MachineList;
}

module.exports = machinelist;
