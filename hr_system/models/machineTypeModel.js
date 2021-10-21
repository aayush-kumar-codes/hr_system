function machineType(database, type) {
  const MachineType = database.define(
    "machineType",
    {
      type: type.STRING,
      value: type.STRING,
      email_id: {
        type: type.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  MachineType.addMachineType = async (reqBody) => {
    try {
      let addMachine = await MachineType.create({
        type: reqBody.type,
        value: reqBody.value,
      });
      return addMachine.id;
    } catch (error) {
      throw new Error(error);
    }
  };
  MachineType.getMachineTypeList = async () => {
    try {
      let machineTypeList = await MachineType.findAll({});
      return machineTypeList;
    } catch (error) {
      throw new Error("Unable to locate all machine types");
    }
  };
  return MachineType;
}

module.exports = machineType;
