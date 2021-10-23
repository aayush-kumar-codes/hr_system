function LifeCycle(database, type) {
  const lifeCycle = database.define("employee_life_cycle", {
    userId: type.INTEGER,
    elc_step_id: type.INTEGER,
    last_update: type.DATE,
  });
  lifeCycle.getLifeCycle = async (reqBody) => {
    try {
      // console.log(reqBody.userid);
      let foundLifeCycle = await lifeCycle.findAll({
        where: { id: reqBody.userid },
      });
      return foundLifeCycle;
    } catch (error) {
      throw new Error(error);
    }
  };
  lifeCycle.updateLife = async (reqBody, models) => {
    try {
      let update_user = await lifeCycle.update(
        { elc_step_id: reqBody.stepid },
        { where: { userId: reqBody.userid } }
      );
      if (update_user[0] !== 0) {
        return "updated";
      } else {
        return "not updated";
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  return lifeCycle;
}

module.exports = LifeCycle;
