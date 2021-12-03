const db = require("../db");
const {
  API_getGenericConfiguration,
  API_updateConfig,
  api_getAverageWorkingHours,
} = require("../settingsFunction");

exports.get_generic_configuration = async (req, res, next) => {
  try {
    let user = req.userData;
    let showSecureData = false;
    if (typeof user.role !== "undefined") {
      showSecureData = true;
    }
    let result = await API_getGenericConfiguration(showSecureData, db);
    res.status_code = 200;
    res.data = result.data;
    res.error = result.error;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.update_config = async (req, res, next) => {
  try {
    if (
      typeof req.body.type === "undefind" &&
      typeof req.body.data === "undefined"
    ) {
      res.error = 1;
      res.data.message = "type and data can't be empty";
      return next();
    } else {
      let type = req.body.type;
      let data = req.body.data;
      let result = await API_updateConfig(type, data, db);
      res.status_code = 200;
      res.message = result.data.message;
      res.error = result.error;
      return next();
    }
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};

exports.get_average_working_hours = async (req, res, next) => {
  try {
    let start_date = req.body.start_date;
    let end_date = req.body.end_date;
    console.log(req.body.start_date == null);
    let result = await api_getAverageWorkingHours(start_date,end_date, db);
    res.status_code = 200;
    res.message = result.data.message;
    res.error = result.error;
    return next();
  } catch (error) {
    res.status_code = 500;
    res.message = error.message;
    return next();
  }
};
