const { responseForInventory } = require("../util/responseHandlers");
const {Op}=require("sequelize")
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

  MachineStatus.DeleteStatus = async (reqBody,res,db) => {
    try {
      console.log(reBody.status)
      const machineStatus = await db.MachineStatus.findAll({
        where:{
          [Op.and]: [
            { status: reqBody.status}, 
            {is_default: 1 }
          ]
        }
      });
      console.log(machineStatus)
      if (machineStatus.length !== 0) {
        const R=[]
        res.message= "status is a default status. It can not be delete.";
        res.error=1
        R.message=res.message;
        res.error=res.error;
        return R;
      } else {
        machineList = await db.MachineList.findAll({
          where: { status: reqBody.status },
        });
        if (machineList.length !== 0) {
        res.message= "Inventory status is in use"
        res.error=0;
          if (reqBody.new_status != false) {
            await db.MachineList.Update(
              { status: reqBody.new_status },
              { where: { status: reqBody.status } }
            );
			db.MachineStatus.destroy({where:{status:reqBody.status}})
			res.message= "Inventories status is changed from $status to $newStatus and $status is deleted"
      res.error=0;
          }
        }else{
			await db.MachineStatus.destroy({where:{status:reqBody.status}})
			res.message= "status removed succesfully"
      res.error =0
		}
      }
      let delete_status = await MachineStatus.destroy({
        where: {
          id: reqBody.id,
        },
      });
      const R=[];
      R.message=res.message;
      R.error=res.error;
      return R;
    } catch (error) {
      throw new Error("Unable to locate status");
    }
  };

  return MachineStatus;
}

module.exports = machine_status;
