function machine_status(database, type) {
  const MachineStatus = database.define("machine_status", {
    status: type.STRING,
    color: type.STRING,
    is_default: type.INTEGER,
  });

  MachineStatus.AddMachineStatus = async (reqBody) => {
    try {
      let creation = await MachineStatus.create({
        status: reqBody.status,
        color: reqBody.color,
        is_default: reqBody.is_default,
      });
      return creation;
    } catch (error) {
      throw new Error(error);
    }
  };

  MachineStatus.getAllStatus = async (limit, offset) => {
    try {
      let all_status = await MachineStatus.findAll({ limit, offset });
      return all_status;
    } catch (error) {
      throw new Error("Unable to locate all status");
    }
  };

  MachineStatus.DeleteStatus = async (reqBody, db) => {
    try {
      const machineStatus = await db.MachineStatus.findAll({
        where: { status: reqBody.status, is_default: 1 },
      });
      // console.log(machineStatus)
      if (machineStatus.length !== 0) {
        return "status is a default status. It can not be delete.";
        // return machineStatus;
      } else {
        machineList = await db.MachineList.findAll({
          where: { status: reqBody.status },
        });
        if (machineList.length !== 0) {
          //  "Inventory status is in use"
          if (reqBody.new_status != false) {
            await db.MachineList.Update(
              { status: reqBody.new_status },
              { where: { status: reqBody.status } }
            );
			db.MachineStatus.destroy({where:{status=reqBody.status}})
			return "Inventories status is changed from $status to $newStatus and $status is deleted"
          }
        }else{
			await db.MachineStatus.destroy({where:{status:reqBody.status}})
			return "status removed succesfully"
		}
      }

      let delete_status = await MachineStatus.destroy({
        where: {
          id: reqBody.id,
        },
      });
      return delete_status;
    } catch (error) {
      throw new Error("Unable to locate status");
    }
  };

  return MachineStatus;
}

module.exports = machine_status;
