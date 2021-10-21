function config(database, type) {
  const config = database.define(
    "config",
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
  config.addMachineType = async (reqBody) => {
    try {
      let addMachine = await config.create({
        type: reqBody.type,
        value: reqBody.value,
      });
      return addMachine.id;
    } catch (error) {
      throw new Error(error);
    }
  };
  config.getMachineTypeList = async () => {
    try {
      let machineTypeList = await config.findAll({});
      return machineTypeList;
    } catch (error) {
      throw new Error("Unable to locate all machine types");
    }
  };
  return config;
}

module.exports = config;
