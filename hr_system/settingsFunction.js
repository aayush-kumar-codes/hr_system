const { QueryTypes } = require("sequelize");
const {
  getConfigByType,
  Inventory_insertDefaultStatuses,
  _getDateTimeData,
} = require("./allFunctions");
const { getEnabledUsersList } = require("./employeeFunction");

const { getDaysOfMonth } = require("./leavesFunctions");

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
        if (q[1] == 1) {
          ret = {
            error: 0,
            data: {
              message: "Update Successfully!!",
            },
          };
        } else {
          ret = {
            error: 1,
            data: {
              message: "Update UnsuccessFull!!",
            },
          };
        }
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
        } else {
        }
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
    throw new Error(error);
  }
};

let updateConfig_reset_password = async (dataFromHeader, models) => {
  try {
    let no_of_days = dataFromHeader.pwd_reset_interval;
    let status = dataFromHeader.pwd_reset_status;
    let error = 0;
    let data = [];
    let q = await models.sequelize.query(
      `SELECT * FROM config WHERE type = 'reset_password'`,
      { type: QueryTypes.SELECT }
    );
    let d = new Date();
    let date = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
    if (q.length > 0) {
      if (typeof no_of_days !== "undefined" && no_of_days !== "") {
        let configValue =
          ' {"days":"' +
          no_of_days +
          '", "status":"' +
          status +
          '", "last_updated":"' +
          date +
          '"}';
        q = await models.sequelize.query(
          `UPDATE config SET value = '${configValue}' WHERE type = 'reset_password'`,
          { type: QueryTypes.UPDATE }
        );
        if (q[1] == 1) {
          data.message = "Config updated successfully";
        } else {
          error = 1;
          data.message = "Config updation failed";
        }
      } else {
        error = 1;
        data.message = "Please provide interval";
      }
    }
    let result = {
      error: error,
      data: data,
    };
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

let updateConfig_add_attendance_csv = async (data1, models) => {
  try {
    let userid_key = false;
    let timing_key = false;
    let keyValue;
    if (typeof data1.userid_key !== "undefined") {
      userid_key = data1.userid_key; //trim
    }
    if (typeof data1.userid_key !== "undefined") {
      timing_key = data1.timing_key;
    }
    let error = 0;
    let data = [];
    let userIdKeys = [];
    let timingKeys = [];
    let q = await models.sequelize.query(
      `SELECT * FROM config WHERE type = 'attendance_csv'`,
      { type: QueryTypes.SELECT }
    );
    if (q.length > 0) {
      let attendance_csv_keys = JSON.parse(q[0].value);
      for (let [key, atCsvKey] of Object.entries(attendance_csv_keys)) {
        if (key == "user_id") {
          userIdKeys = atCsvKey;
        }
        if (key == "time") {
          timingKeys = atCsvKey;
        }
      }
      if (typeof userid_key !== "undefined" && userid_key !== "") {
        if (await inArray(userid_key, userIdKeys)) {
          error = 1;
          data.message = "UserId key already exist.";
        } else {
          userIdKeys.push(userid_key);
          keyValue =
            ' {"user_id":' +
            JSON.stringify(userIdKeys) +
            ', "time":' +
            JSON.stringify(timingKeys) +
            "}";
          let q = await models.sequelize.query(
            `UPDATE config SET value = '${keyValue}' WHERE type = 'attendance_csv'`,
            { type: QueryTypes.UPDATE }
          );
          if (q[1] == 1) {
            data.message = "userId key updated.";
          } else {
            error = 1;
            data.message = "userId key update failed";
          }
        }
      }
      if (typeof timing_key !== "undefined" && userid_key !== "") {
        if (await inArray(timing_key, timingKeys)) {
          error = 1;
          data.message = "time key already exist";
        } else {
          timingKeys.push(timing_key);
          keyValue =
            ' {"user_id":' +
            JSON.stringify(userIdKeys) +
            ', "time":' +
            JSON.stringify(timingKeys) +
            "}";
          let q = await models.sequelize.query(
            `UPDATE config SET value = '${keyValue}' WHERE type = 'attendance_csv'`,
            { type: QueryTypes.UPDATE }
          );
          if (q[1] == 1) {
            data.message = "time key updated";
          } else {
            error = 1;
            data.message = "time key update failed";
          }
        }
      }
    } else {
      if (typeof userid_key !== "undefined" && userid_key !== "") {
        userIdKeys.push(userid_key);
      }
      if (typeof timing_key !== "undefined" && timing_key !== "") {
        timingKeys.push(timing_key);
      }
      keyValue =
        ' {"user_id":' +
        JSON.stringify(userIdKeys) +
        ', "time":' +
        JSON.stringify(timingKeys) +
        "}";
      let q = await models.sequelize.query(
        ` INSERT INTO config( type, value ) VALUES( 'attendance_csv', '${keyValue}' )`,
        { type: QueryTypes.INSERT }
      );
      if (q[1] == 1) {
        data.message = "Row created and Key added";
      } else {
        error = 1;
        data.message = "Row creation failed";
      }
    }
    let result = {
      error: error,
      data: data,
    };
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

let inArray = async (needle, haystack) => {
  var length = haystack.length;
  for (var i = 0; i < length; i++) {
    if (haystack[i] == needle) return true;
  }
  return false;
};

let updateConfig_delete_attendance_csv = async (dataFromHeader, models) => {
  try {
    let field_name;
    let key_text;
    let userIdKeys;
    let timingKeys;
    if (typeof dataFromHeader.key_text !== "undefined") {
      key_text = dataFromHeader.key_text; //trim
    }
    if (typeof dataFromHeader.field_name !== "undefined") {
      field_name = dataFromHeader.field_name; //trim
    }
    let error = 0;
    let data = [];
    let q = await models.sequelize.query(
      `SELECT * FROM config WHERE type = 'attendance_csv'`,
      { type: QueryTypes.SELECT }
    );
    if (q.length > 0) {
      let attendance_csv_keys = JSON.parse(q[0].value);
      for (let [key, atCsvKey] of Object.entries(attendance_csv_keys)) {
        if (key == "user_id") {
          userIdKeys = atCsvKey;
        }
        if (key == "time") {
          timingKeys = atCsvKey;
        }
      }
      if (field_name == "user_id") {
        if (await inArray(key_text, userIdKeys)) {
          let start = "[";
          let end = "]";
          let userIdKeysString = "";
          let timeKeysString = "";
          for (let [k, uid] of Object.entries(userIdKeys)) {
            if (uid == key_text) {
              delete userIdKeys[k];
              continue;
            }
            userIdKeysString = userIdKeysString + '"' + uid + '",';
          }
          for (let [k, time] of Object.entries(timingKeys)) {
            timeKeysString = timeKeysString + '"' + time + '",';
          }
          userIdKeysString = start + (await rtrim(userIdKeysString, ",")) + end;
          timeKeysString = start + rtrim(timeKeysString, ",") + end;
          keyValue =
            ' {"user_id":' +
            userIdKeysString +
            ', "time":' +
            timeKeysString +
            "}";
          let q = await models.sequelize.query(
            `UPDATE config SET value = '${keyValue}' WHERE type = 'attendance_csv'`,
            { type: QueryTypes.UPDATE }
          );
          if (q[1] == 1) {
            data.message = "UserId key deleted";
          } else {
            error = 1;
            data.message = "UserId key deletion failed";
          }
        } else {
          data.message = "UserId key not found";
        }
      } else if (field_name == "time") {
        if (await inArray(key_text, timingKeys)) {
          let start = "[";
          let end = "]";
          let userIdKeysString = "";
          let timeKeysString = "";
          for (let [k, time] of Object.entries(timingKeys)) {
            if (time == key_text) {
              delete timingKeys[k];
              continue;
            }
            timeKeysString = timeKeysString + '"' + time + '",';
          }
          for (let [k, uid] of Object.entries(userIdKeys)) {
            userIdKeysString = userIdKeysString + '"' + uid + '",';
          }
          userIdKeysString = start + (await rtrim(userIdKeysString, ",")) + end;
          timeKeysString = start + (await rtrim(timeKeysString, ",")) + end;
          keyValue =
            ' {"user_id":' +
            userIdKeysString +
            ', "time":' +
            timeKeysString +
            "}";
          let q = await models.sequelize.query(
            `UPDATE config SET value = '${keyValue}' WHERE type = 'attendance_csv'`,
            { type: QueryTypes.UPDATE }
          );
          if (q[1] == 1) {
            data.message = "Time key deleted";
          } else {
            error = 1;
            data.message = "Time key deletion failed";
          }
        } else {
          data.message = "Time key not found";
        }
      } else {
        data.message = "Key not found in both field";
      }
    } else {
      data.message = "No data Found";
    }
    let result = {
      error: error,
      data: data,
    };
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

let rtrim = async (str, chr) => {
  var rgxtrim = !chr ? new RegExp("\\s+$") : new RegExp(chr + "+$");
  return str.replace(rgxtrim, "");
};

let empty = async (mixedVar) => {
  let undef;
  let key;
  let i;
  let len;
  const emptyValues = [undef, null, false, 0, "", "0"];
  for (i = 0, len = emptyValues.length; i < len; i++) {
    if (mixedVar === emptyValues[i]) {
      return true;
    }
  }
  if (typeof mixedVar === "object") {
    for (key in mixedVar) {
      if (mixedVar.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }
  return false;
};

let updateConfigTypeValue = async (type, value, models) => {
  try {
    let message;
    let q = await models.sequelize.query(
      `select * from config where type='${type}'`,
      { type: QueryTypes.SELECT }
    );
    if (q.length > 0) {
      q = await models.sequelize.query(
        `UPDATE config set value='${value}' WHERE type = '${type}'`,
        { type: QueryTypes.UPDATE }
      );
      if (q[1] == 1) {
        message = "Updated Successfully!!";
      } else {
        message = "Update Unsuccessfull";
      }
    } else {
      q = await models.sequelize.query(
        `INSERT into config ( type, value  ) VALUES ( '${type}', '${value}' )`,
        { type: QueryTypes.INSERT }
      );
      if (q[1] == 1) {
        message = "Added Successfully!!";
      } else {
        message = "Adding Unsuccessfull";
      }
    }
    let ret = {
      error: 0,
      data: {
        message: message,
      },
    };
    return ret;
  } catch (error) {
    throw new Error(error);
  }
};

let updateConfig_rh_config = async (data, models) => {
  try {
    let message;
    let type = "rh_config";
    let rh_config = await getConfigByType(type, models);
    let diff = Object.entries(data).filter(
      (x) => !Object.entries(rh_config).includes(x)
    );
    if (!(await empty(diff))) {
      let json = JSON.stringify(data);
      let update = await updateConfigTypeValue(type, json, models);
      message = update.data.message;
    } else {
      message = "Values already exist";
    }
    let ret = {
      error: 0,
      data: {
        message: message,
      },
    };
    return ret;
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

      case "alternate_saturday":
        return await updateConfig_alternate_saturday(data, models);

      case "reset_password":
        return await updateConfig_reset_password(data, models);

      case "add_attendance_csv":
        return await updateConfig_add_attendance_csv(data, models);

      case "delete_attendance_csv":
        return await updateConfig_delete_attendance_csv(data, models);

      case "rh_config":
        return await updateConfig_rh_config(data, models);
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
    throw new Error(error);
  }
};

let api_getAverageWorkingHours = async (startDate, endDate, models) => {
  try {
    if (startDate == "" || endDate == "") {
      let d = await _getDateTimeData();
      endDate =
        d.current_year_number +
        "-" +
        d.current_month_number +
        "-" +
        d.current_date_number;
      let newd = new Date(endDate);
      let sevenDaysBefore = newd.setDate(newd.getDate() - 6);
      let dateNow = new Date(sevenDaysBefore);
      startDate = `${dateNow.getFullYear()}-${
        dateNow.getMonth() + 1
      }-${dateNow.getDate()}`;

    }
    let Date = [];
    let dates = await _getDatesBetweenTwoDates(startDate, endDate, models);
    console.log(dates);
    let enabledUsersList = await getEnabledUsersList(sortedby=false, models);
    console.log(enabledUsersList);
    let hideUsersArray = ['302','300','415','420'];
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = {
  API_getGenericConfiguration,
  API_updateConfig,
  api_getAverageWorkingHours,
};
