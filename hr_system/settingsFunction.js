const { QueryTypes } = require("sequelize");
const {
  getConfigByType,
  Inventory_insertDefaultStatuses,
  _getDateTimeData,
} = require("./allFunctions");

const {getDaysOfMonth} = require("./leavesFunctions");

let API_getGenericConfiguration = async (showSecure = false, models) => {
  try {
    let login_types = await getConfigByType("login_types", models);
    let data = {};
    data.login_types = login_types;
    let result;
    if (showSecure) {
      let attendance_csv = await getConfigByType("attendance_csv", models);
      let reset_password = await getConfigByType("reset_password", models);
      let web_show_salary = await getConfigByType("web_show_salary", models);
      let alternate_saturday = await getConfigByType(
        "alternate_saturday",
        models
      );
      let page_headings = await getConfigByType("page_headings", models);
      let inventory_audit_comments = await getConfigByType(
        "inventory_audit_comments",
        models
      );
      let attendance_late_days = await getConfigByType(
        "attendance_late_days",
        models
      );
      let rh_config = await getConfigByType("rh_config", models);
      let defaultInventoryStatuses = await Inventory_insertDefaultStatuses(
        models
      );
      data.attendance_csv = attendance_csv;
      data.reset_password = reset_password;
      data.web_show_salary = web_show_salary;
      data.alternate_saturday = alternate_saturday;
      data.page_headings = page_headings;
      data.inventory_audit_comments = inventory_audit_comments;
      data.attendance_late_days = attendance_late_days;
      data.rh_config = rh_config;
    }
    result = {
      error: false,
      data: data,
    };
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

let updateConfig_login_types = async (data, models) => {
  try {
    let normal_login = true;
    let google_login = false;
    let google_auth_client_id;
    let ret;
    if (typeof data.normal_login !== "undefined") {
      normal_login = data.normal_login;
    } else if (typeof data.google_login !== "undefined") {
      google_login = data.google_login;
    } else if (typeof data.google_auth_client_id !== "undefined") {
      google_auth_client_id = data.google_auth_client_id;
    } else if ((normal_login = false) && (google_login = false)) {
      ret = {
        error: 1,
        data: {
          message: "Atleast one type needs to be enabled!!",
        },
      };
      return ret;
    } else {
      if (google_login == true && google_auth_client_id === "") {
        ret = {
          error: 1,
          data: {
            message: "Google auth client id can not be empty!!",
          },
        };
        return ret;
      } else {
        let finalValues = {
          normal_login: normal_login,
          google_login: google_login,
          google_auth_client_id: google_auth_client_id,
        };
        let json = JSON.stringify(finalValues);
        let q = await models.sequelize.query(
          `UPDATE config set value='${json}' WHERE type = 'login_types'`,
          { type: QueryTypes.UPDATE }
        );
        ret = {
          error: 0,
          data: {
            message: "Update Successfully!!",
          },
        };
        return ret;
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};

let setOffSaturdaysAsHoliday = async (start_month, satOnOff, models) => {
  try {
    let c = _getDateTimeData();
    let c_year = (await c).current_year_number;
    let newHolidays = [];
    for (let i; i <= 12; i++) {
      if (i >= start_month) {
        let monthDates = await getDaysOfMonth(c_year, i);
        let satCheckCount = 0;
        for (let [key, date] of monthDates) {
          if (date.day.toLowerCase() == "saturday") {
            satCheckCount++;
            if (!satOnOff.satCheckCount) {
              newHolidays.push(date);
            }
          }
        }
      }
    }
    if (newHolidays.length > 0) {
      for (let [key, holiday] of Object.entries(newHolidays)) {
        date = holiday.full_date;
        let q = await models.sequelize.query(
          `SELECT * FROM holidays WHERE date='${date}'`,
          { type: QueryTypes.SELECT }
        );
        if (q.length == 0) {
          let q = await models.sequelize.query(
            `Insert into holidays (name, date, type) values ("Saturday Off", '${date}', 0) `,
            { type: QueryTypes.INSERT }
          );
        }else{}
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};

let updateConfig_alternate_saturday = async (data, models) => {
  try {
    let start_month = data.start_month;
    let value = data.value;
    let vals = JSON.parse(JSON.stringify(value));
    let status_setOffSaturdaysAsHoliday = await setOffSaturdaysAsHoliday(
      start_month,
      vals,
      models
    );
    let checkExists = await getConfigByType("alternate_saturday", models);
    let finalValues = [];
    if (checkExists.length > 0) {
      finalValues = checkExists;
    }
    let newValue = [];
    let d = await _getDateTimeData();
    newValue.data = vals;
    newValue.updated_date = `${d.current_year_number}-${d.current_month_number}-${d.current_date_number}`;
    newValue.updated_timestamp = d.current_timestamp;
    newValue.start_date = `${d.current_year_number}-${start_month}-${d.current_date_number}`;
    finalValues.push(newValue);
    let v = JSON.stringify(finalValues);
    let q = await models.sequelize.query(
      `UPDATE config set value='${v}' WHERE type = 'alternate_saturday'`,
      { type: QueryTypes.UPDATE }
    );
    let result = {
      error: 0,
      data: {
        message: "Update Successfully!!",
      },
    };
    return result;
  } catch (error) {
      console.log(error);
    throw new Error(error);
  }
};

let API_updateConfig = async (type, data, models) => {
  try {
    let directlyUpdateTypes = [
      "web_show_salary",
      "page_headings",
      "attendance_late_days",
    ];
    switch (type) {
      case "login_types":
        return await updateConfig_login_types(data, models);
        break;

      case "alternate_saturday":
        return await updateConfig_alternate_saturday(data, models);
        break;

      case "reset_password":
        return await updateConfig_reset_password(data, models);
        break;

      case "add_attendance_csv":
        return await updateConfig_add_attendance_csv(data, models);
        break;

      case "delete_attendance_csv":
        return await updateConfig_delete_attendance_csv(data, models);
        break;

      case "rh_config":
        return await updateConfig_rh_config(data, models);
        break;

      /* if no conditional thing is there we can directly update/delete type and value*/
      default:
        if (directlyUpdateTypes.includes(type)) {
          return await updateConfigTypeValue(type, data, models);
        }
        break;
    }

    ret = {
      error: 1,
      data: {
        message: "Nothing has been done!!",
      },
    };
    return ret;
  } catch (error) {
    //   console.log(error);
    throw new Error(error);
  }
};

module.exports = { API_getGenericConfiguration, API_updateConfig };
