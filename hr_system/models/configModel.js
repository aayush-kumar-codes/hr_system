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

  // config.addTeam = async (reqBody) => {
  //   try {
  //     let teamToAdd = await config.create({
  //       type: reqBody.type,
  //       value: reqBody.value,
  //     });
  //     return teamToAdd;
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // };

  // config.findTeam = async () => {
  //   try {
  //     let foundTeam = await config.findAll({where: {type: "team_list"}});
  //     if (foundTeam) {
  //       return foundTeam;
  //     } else {
  //       return "team not found";
  //     }
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // };
  return config;
}

module.exports = config;
