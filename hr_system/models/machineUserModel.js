function machineuser(database, type) {
  const machines_user = database.define(
    "machines_user",
    {
      machine_id: type.INTEGER,
      user_Id: type.INTEGER,
      assign_date: type.DATE,
      updated_at: type.DATE,
      updated_by_userid: type.INTEGER,
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );
  machineuser.associate = (models) => {
    models.machineuser.hasOne(models.User, {
      foreignKey: "updated_by_userid",
      as: "updated_by_user",
    });
  };

  machines_user.updateUser = async (reqBody) => {
    try {
      let creation = await machines_user.updateOne(
        {
          user_Id: reqBody.user_id,
        },
        { where: { machine_id: reqBody.machine_id } }
      );
      if (creation) {
        return creation;
      } else {
        return "machine_id not found";
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  // machines_user.AssignMachine = async (reqBody,db) => {
  //   try {
  //     const machineinfo=await db.MachineStatus.findOne({where:{id:reqBody.body.machine_id}});
  //     if(machineinfo.status!="sold"){
  //     let find_machine = await machines_user.findOne({
  //       where: { machine_id: reqBody.body.machine_id },
  //     });
  //     if (!find_machine) {
  //       const details = await machines_user.create({
  //         machine_id: reqBody.body.machine_id,
  //         user_Id: reqBody.body.user_id,
  //         updated_by_userid: reqBody.userData.data.id,
  //       });
  //     } else {
  //       const details = await machines_user.update(
  //         {
  //           machine_id: reqBody.body.machine_id,
  //           user_Id: reqBody.body.user_id,
  //           updated_by_userid: reqBody.userData.data.id,
  //         },
  //         {
  //           where: {
  //             id: find_machine.id,
  //           },
  //         }
  //       );
  //     }
  //     let updatedMachine=await db.MachineList({is_unassign_request:0,ownership_change_req_by_user:0},
  //       {where:{id:reqBody.body.machine_id}})
  //     return "Done";
  //   }
  //   else{
  //     return "error";
  //   }
  //   } catch (error) {
  //     console.log(error, "error from assign machine");
  //     throw new Error(error);
  //   }
  // };

  return machines_user;
}

module.exports = machineuser;
