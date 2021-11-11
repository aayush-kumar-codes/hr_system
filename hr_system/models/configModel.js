const { responseForData } = require("../util/responseHandlers");

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
  config.getMachineTypeList = async () => {
    try {
      let r_error;
      let r_data;
      let r_message;
      let machineTypeList = await config.findAll({type:"machine_type"});
      if(machineTypeList.length!==0){
        r_error=0,
        r_data = machineTypeList;
        r_message=1;
      }else{
          r_error=1,
          r_message="no machine type list found"
      }
     let Return =[];
      Return.error=r_error;
      Return.data= r_data;
      Return.message=r_message
    return Return
    } catch (error) {
      throw new Error("Unable to locate all machine types");
    }
  };

  config.addTeam = async (reqBody) => {
    try {
      let teamToAdd = await config.create({
        type: reqBody.type,
        value: reqBody.value,
      });
      return teamToAdd;
    } catch (error) {
      throw new Error(error);
    }
  };

  config.findTeam = async () => {
    try {
      let foundTeam = await config.findAll({where: {type: "team_list"}});
      if (foundTeam) {
        return foundTeam;
      } else {
        return "team not found";
      }
    } catch (error) {
      throw new Error(error);
    }
  };
  return config;
}

module.exports = config;
