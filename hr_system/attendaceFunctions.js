const { QueryTypes } = require("sequelize");
const _ = require("lodash");
const { getUserInfo } = require("./allFunctions");
const {
  _getDatesBetweenTwoDates,
  getUserMonthAttendace,
} = require("./leavesFunctions");
const { inArray, empty } = require("./settingsFunction");

let getFileByID = async (fileId, models) => {
  try {
    if (fileId) {
      let q = models.sequelize.query(
        `SELECT * FROM files WHERE id = ${fileId}`,
        { type: QueryTypes.SELECT }
      );
      return q;
    }
    return false;
  } catch (error) {
    throw new Error(error);
  }
};

let getUserTimeSheet = async (userid, from_date, models) => {
  try {
    let data = [];
    let newd = new Date(from_date);
    let sevenDaysBefore = newd.setDate(newd.getDate() + 6);
    let dateNow = new Date(sevenDaysBefore);
    let to_date = `${dateNow.getFullYear()}-${
      dateNow.getMonth() + 1
    }-${dateNow.getDate()}`;
    let user = await getUserInfo(userid, models);
    let username = user.username;
    let q = await models.sequelize.query(
      `SELECT * FROM timesheet WHERE user_id = '${userid}' AND date >= '${from_date}' AND date <= '${to_date}'`,
      { type: QueryTypes.SELECT }
    );
    let fromNewDate = new Date(from_date);
    let toNewDate = new Date(to_date);
    let from_month = fromNewDate.getMonth();
    let from_year = fromNewDate.getFullYear();

    let to_month = toNewDate.getMonth();
    let to_year = toNewDate.getFullYear();
    let week_dates = await _getDatesBetweenTwoDates(from_date, to_date);
    let from_month_summary,
      to_month_summary = false;
    if (from_year == to_year) {
      if (from_month == to_month) {
        from_month_summary = await getUserMonthAttendace(
          userid,
          from_year,
          from_month,
          models
        );
      } else {
        from_month_summary = await getUserMonthAttendace(
          userid,
          from_year,
          from_month,
          models
        );
        to_month_summary = await getUserMonthAttendace(
          userid,
          to_year,
          to_month,
          models
        );
      }
    } else {
      if (from_month == to_month) {
        from_month_summary = await getUserMonthAttendace(
          userid,
          from_year,
          from_month,
          models
        );
      } else {
        from_month_summary = await getUserMonthAttendace(
          userid,
          from_year,
          from_month,
          models
        );
        to_month_summary = await getUserMonthAttendace(
          userid,
          to_year,
          to_month,
          models
        );
      }
    }
    let filepath =
      process.env.ENV_BASE_URL + "attendance/uploads/timesheetDocuments/";
    if (from_month_summary) {
      for await (let summary of from_month_summary) {
        if (await inArray(summary.full_date, week_dates)) {
          summary.userid = userid;
          summary.username = username;
          summary.total_hours = 0;
          summary.comments = "";
          summary.status = "";
          summary.fileId = "";
          summary.file = "";
          for await (let row of q) {
            if (row.date == summary.full_date) {
              summary.total_hours = row.hours;
              summary.comments = row.comments;
              summary.status = row.status;
              if (!(await empty(row.fileId))) {
                let fileId = row.fileId;
                let file = await getFileByID(fileId, models);
                summary.fileId = fileId;
                summary.file = filepath + file.file_name;
              }
            }
          }
          data.push(summary);
        }
      }
    }
    if (to_month_summary) {
      for await (let summary of to_month_summary) {
        if (await inArray(summary.full_date, week_dates)) {
          summary.userid = userid;
          summary.username = username;
          summary.total_hours = 0;
          summary.comments = "";
          summary.status = "";
          summary.fileId = "";
          summary.file = "";
          for await (let row of q) {
            if (row.date == summary.full_date) {
              summary.total_hours = row.hours;
              summary.comments = row.comments;
              summary.status = row.status;
              if (!(await empty(row.fileId))) {
                let fileId = row.fileId;
                let file = await getFileByID(fileId, models);
                summary.fileId = fileId;
                summary.file = filepath + file.file_name;
              }
            }
          }

          data.push(summary);
        }
      }
    }
    return data;
  } catch (error) {
    throw new Error(error);
  }
};

let API_getUserTimeSheet = async (userid, from_date, models) => {
  try {
    let timesheet = await getUserTimeSheet(userid, from_date, models);
    let result = {
      error: 0,
      data: timesheet,
    };
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

let userTimeSheetEntry = async (data, models) => {
  try {
    let error = 0;
    let message = "";
    let hours;
    let date;
    let status;
    let comments;
    let required = ["user_id", "date", "hours"];
    let data_keys = _.keysIn(data);
    let keys = _.filter(data_keys, function (key) {
      return inArray(key, required) && _.isEmpty(data.key);
    });
    if ((await empty(keys)) == false) {
      delete data.action;
      delete data.token; // if not token not found in body delete this line
      date = data.date;
      userid = data.user_id;
      let q = await models.sequelize.query(
        `SELECT * FROM timesheet WHERE date = '${date}' AND user_id = ${userid}`,
        { type: QueryTypes.SELECT }
      );
      if (_.isEmpty(q)) {
        if (
          await models.sequelize.query(
            `insert into timesheet 
            (user_id, date, hours, comments, fileId, applied_on) VALUES 
            (${data.user_id}, '${date}', ${data.hours}, '${data.comments}', ${data.fileId}, '${data.applied_on}')`,
            { type: QueryTypes.INSERT }
          )
        ) {
          hours = q.hours;
          date = q.date;
          comments = data.comments;
          message = "Time Sheet Updated";
        } else {
          error = 1;
          message = "DATA insertion failed";
        }
      } else {
        if ((q.submitted && q.status) != "Rejected") {
          error = 1;
          message = "Entry already submitted, you cam't edit";
        } else {
          id = q.id;
          hours = data.hours;
          comments = data.comments;
          fileId = data.fileId;
          status = q.status;
          let queryTo = "UPDATE timesheet set hours =" + hours + "";
          if (comments) {
            await models.sequelize.query(
              (queryTo +=
                ", comments =" +
                comments +
                "WHERE date =" +
                date +
                "AND user_id =" +
                userid),
              { type: QueryTypes.UPDATE }
            );
          }
          if (fileId) {
            await models.sequelize.query(
              (queryTo +=
                ", fileId =" +
                fileId +
                "WHERE date =" +
                date +
                "AND user_id =" +
                userid),
              { type: QueryTypes.UPDATE }
            );
          }
          if (status) {
            await models.sequelize.query(
              (queryTo +=
                ", status =" +
                status +
                "WHERE date =" +
                date +
                "AND user_id =" +
                userid),
              { type: QueryTypes.UPDATE }
            );
          }
          if (q[1] == 1) {
            message = "time sheet updated";
          } else {
            error = 1;
            message = "time sheet update failed";
          }
        }
      }
    } else {
      error = 1;
      message = _.join(", ", keys) + " cant be empty or null";
    }
    let result = {
      error: error,
      message: message,
    };
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

let API_userTimeSheetEntry = async (data, models) => {
  try {
    {
      let result = await userTimeSheetEntry(data, models);
      return result;
    }
  } catch (error) {
    throw new Error(error);
  }
};

let getMonday = async (d) => {
  d = new Date(d);
  let day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

let getSunday = async (d) => {
  d = new Date(d);
  let day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -7 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

let submitUserTimeSheet = async (userid, monday, models) => {
  try {
    let error = 1;
    let message = "Time sheet already submitted";
    let enable_submit = false;
    let d = await getMonday(monday);
    let sd = await getSunday(monday);
    let date;
    monday = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    let sunday = `${sd.getFullYear()}-${sd.getMonth() + 1}-${sd.getDate()}`;
    let timesheet = await getUserTimeSheet(userid, monday, models);
    if (timesheet.length > 0) {
      for await (let entry of timesheet) {
        if (entry.day_type == "WORKING_DAY" && entry.status == "Saved") {
          date = entry.full_date;
          let q = models.sequelize.query(
            `UPDATE timesheet set submitted = 1, status = 'Pending', updated_at = CURRENT_TIMESTAMP WHERE user_id = '${userid}' AND date = '${date}'`,
            { type: QueryTypes.UPDATE }
          );
          if (q[1] == 1) {
            error = 0;
            message = "Time Sheet Updated and Submit Sucessfully.";
          }
        }
      }
      if ((error = 0)) {
        let baseURL = process.env.ENV_BASE_URL;
        let approveLink = `${baseURL}attendance/API_HR/api.php?action=update_user_full_timesheet_status&from_date=${monday}&user_id=${userid}&status=Approved`;
        let rejectLink = `${baseURL}attendance/API_HR/api.php?action=update_user_full_timesheet_status&from_date=${monday}&user_id=${userid}&status=Rejected`;
        //   let format_date =
      }
    } else {
      error = 1;
      message = "No Time Sheet has been found";
    }
    let result = {
      error: error,
      message: message,
    };
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

let API_submitUserTimeSheet = async (userid, monday, models) => {
  try {
    let result = await submitUserTimeSheet(userid, monday, models);
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = {
  API_submitUserTimeSheet,
  API_getUserTimeSheet,
  API_userTimeSheetEntry,
  //   getUserMonthAttendaceComplete,
};
