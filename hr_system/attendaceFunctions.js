const { QueryTypes } = require("sequelize");
const _ = require("lodash");
const moment = require("moment");
const { getUserInfo } = require("./allFunctions");
const {
  _getDatesBetweenTwoDates,
  getUserMonthAttendace,
} = require("./leavesFunctions");
const { inArray, empty } = require("./settingsFunction");
const { getEnabledUsersList } = require("./employeeFunction");

let getFileByID = async (fileId, models) => {
  try {
    if (fileId) {
      let q = await models.sequelize.query(
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
    diff = d.getDate() - day + (day == 0 ? -7 : 0); // adjust when day is sunday
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
          let q = await models.sequelize.query(
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

let getUserPendingTimeSheetMonthly = async (userid, year, month, models) => {
  try {
    let date_like = year + "-" + month;
    let q = await models.sequelize.query(
      `SELECT * FROM timesheet WHERE user_id = ${userid} AND date LIKE '%${date_like}%' AND submitted = 1 AND status = 'Pending' ORDER BY updated_at DESC`,
      { type: QueryTypes.SELECT }
    );
    return q;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

let pendingTimeSheets = async (year, month, models) => {
  try {
    let timesheets = [];
    let sorted_timesheets = [];
    let latest_submit_by_user = [];
    let users = await getEnabledUsersList((sortedBy = false), models);
    for await (let user of users) {
      if (!(await empty(user.user_Id))) {
        let userid = user.user_Id;
        let timesheet = await getUserPendingTimeSheetMonthly(
          userid,
          year,
          month,
          models
        );
        let month_summary = await getUserMonthAttendace(
          userid,
          year,
          month,
          models
        );
        let user_timesheet = [];
        if (timesheet.length > 0) {
          latest_submit_by_user[userid] = timesheet[0].update_at;
          let filepath =
            process.env.ENV_BASE_URL + "attendance/uploads/timesheetDocuments/";
          for await (let timesheet_entry of timesheet) {
            let date = timesheet_entry.date;
            timesheet_entry.total_hours = timesheet_entry.hours;
            delete timesheet_entry.hours;
            timesheet_entry.file = "";
            if (!(await empty(timesheet_entry.fileId))) {
              let file = await getFileByID(timesheet_entry.fileId, models);
              timesheet_entry.file = filepath + file.file_name;
            }
            let summary = _.keysIn(
              _.filter(month_summary, function (iter) {
                return iter.full_date == date;
              })
            );
            let timesheet_entry_data = _.merge(summary[0], timesheet_entry);
            user_timesheet.push(timesheet_entry_data);
          }
          user.timesheet = user_timesheet;
          timesheets.push(user);
        }
      }
    }
    _.sortBy(latest_submit_by_user, function (o) {
      o;
    });

    let userIds = _.keysIn(latest_submit_by_user);
    for await (let userid of userIds) {
      for await (let timesheet of timesheets) {
        if (userid == timesheet.user_Id) {
          sorted_timesheets.push(timesheet);
        }
      }
    }
    return sorted_timesheets;
  } catch (error) {
    throw new Error(error);
  }
};

let API_pendingTimeSheets = async (year, month, models) => {
  try {
    let error = 0;
    let timesheets = await pendingTimeSheets(year, month, models);
    let result = {
      error: error,
      data: timesheets,
    };
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

let getUserSubmittedTimesheet = async (userid, monday, models) => {
  try {
    let data = [];
    let d = await getMonday(monday);
    let sd = await getSunday(monday);
    monday = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    let sunday = `${sd.getFullYear()}-${sd.getMonth() + 1}-${sd.getDate()}`;
    console.log(monday, sunday, "------------------------------");
    let q = await models.sequelize.query(
      `SELECT * FROM timesheet WHERE user_id = '${userid}' AND date >= '${monday}' AND date <= '${sunday}' AND submitted = 1`,
      { type: QueryTypes.SELECT }
    );
    console.log(q);
    if (q.length > 0) {
      let fromNewDate = new Date(monday);
      let toNewDate = new Date(sunday);
      let from_month = fromNewDate.getMonth();
      let from_year = fromNewDate.getFullYear();
      let to_month = toNewDate.getMonth();
      let to_year = toNewDate.getFullYear();
      let week_dates = await _getDatesBetweenTwoDates(monday, sunday);
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
            from_month
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
                if (!_.isEmpty(row.fileId)) {
                  let fileId = row.fileId;
                  let file = await getFileByID(row.fileId, models);
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
              if (row.data == summary.full_date) {
                summary.total_hours = row.hours;
                summary.comments = row.comments;
                summary.status = row.status;
                if (!_.isEmpty(row.fileId)) {
                  let fileId = row.fileId;
                  let file = await getFileByID(row.fileId, models);
                  summary.fileId = fileId;
                  summary.file = filepath + file.file_name;
                }
              }
            }
            data.push(summary);
          }
        }
      }
    }
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

let API_getUserSubmittedTimesheet = async (userid, monday, models) => {
  try {
    let result = {};
    let timesheet = await getUserSubmittedTimesheet(userid, monday, models);
    if (timesheet.length > 0) {
      result.error = 0;
      result.data = timesheet;
    } else {
      result.error = 1;
      result.message = "there is no timesheet submitted for the week";
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

let updateUserTimeSheetStatus = async (userid, date, status, models) => {
  try {
    let status = status ? status : "Pending";
    let message = "";
    let error = 0;
    let approved_on = false;
    let q = await models.sequelize.query(
      `SELECT * FROM timesheet WHERE user_id = ${userid} AND date = '${date}'`,
      { type: QueryTypes.SELECT }
    );
    if (!_.isEmpty(q[0]) && Object.keys(q[0]).length > 0) {
      if (q[0].status != "Approved") {
        if (status == "Approved") {
          let hours = q[0].hours;
          let entry_time = "10:30 AM";
          let now = new Date();
          let nowDateTime = now.toISOString();
          let nowDate = nowDateTime.split("T")[0];
          let target = new Date(nowDate + entry_time);
          let lastTime = target + 60 * 60 * hours;
          let exit_time = moment(lastTime).format("LT");
          let inTime = date + " " + entry_time;
          let outTime = date + " " + exit_time;
          let punch_in = moment(inTime, "MM DD YYYY hh:mm:ss A");
          let punch_out = moment(outTime, "MM DD YYYY hh:mm:ss A");
          await insertUserPunchTime(userid, punch_in);
          await insertUserPunchTime(userid, punch_out);
          approved_on = moment("YYYY-MM-DD");
        }
        let qString =
          "UPDATE timesheet SET status ='" +
          status +
          "', updated_at ='" +
          Date.now();
        if (approved_on) {
          qString += "' , approved_on ='" + approved_on + "'";
        }
        qString +=
          "where user_id ='" +
          userid +
          " AND date >= '" +
          monday_date +
          "' AND date <= '" +
          sunday_date +
          "'";
        if (q[1] == 1) {
          error = 0;
          message = `Your time sheet entry for date ${date} has been $status`;
        } else {
          error = 1;
          message = "Update Failed";
        }
      } else {
        error = 1;
        message = `The Time Sheet Entry for date ${date} is already Approved`;
      }
      if (error == 0) {
        // let format_date = send notification part
      }
    } else {
      error = 1;
      message = "Timesheet Entry Not Found";
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

let API_updateUserTimeSheetStatus = async (userid, date, status, models) => {
  try {
    let result = await updateUserTimeSheetStatus(userid, date, status, models);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

let updateUserFullTimeSheetStatus = async (userid, monday, status, models) => {
  try {
    let error = 1;
    let message = "";
    let approved_on = false;
    status = status ? status : "Pending";
    let timesheet = await getUserSubmittedTimesheet(userid, monday, models);
    let timesheet_monday = timesheet[0];
    let timesheet_sunday = timesheet.length - 1;
    let monday_date = timesheet_monday.full_date;
    let sunday_date = timesheet_sunday.full_date;
    if (timesheet.length > 0) {
      if (status == "Approved") {
        for await (let day of timesheet) {
          if (day.total_hours > 0) {
            let date = day.full_date;
            let hours = day.total_hours;
            let now = new Date();
            let nowDateTime = now.toISOString();
            let nowDate = nowDateTime.split("T")[0];
            let entry_time = "10:30 AM";
            let target = new Date(nowDate + entry_time);
            let lastTime = target + 60 * 60 * hours;
            let exit_time = moment(lastTime).format("LT");
            let inTime = date + " " + entry_time;
            let outTime = date + " " + exit_time;
            let punch_in = moment(inTime, "MM DD YYYY hh:mm:ss A");
            let punch_out = moment(outTime, "MM DD YYYY hh:mm:ss A");
            await insertUserPunchTime(userid, punch_in);
            await insertUserPunchTime(userid, punch_out);
          }
        }
        approved_on = moment("YYYY-MM-DD");
      }
      let qString =
        "UPDATE timesheet SET status ='" +
        status +
        "', updated_at ='" +
        Date.now();
      if (approved_on) {
        qString += "' , approved_on ='" + approved_on + "'";
      }
      qString +=
        "where user_id ='" +
        userid +
        " AND date >= '" +
        monday_date +
        "' AND date <= '" +
        sunday_date +
        "'";
      if (q[1] == 1) {
        error = 0;
        message = `Time Sheet from ${monday_date} to ${sunday_date} has been ${status}`;
      } else {
        message = "Time sheet update failed";
      }
    } else {
      message = "No time sheet found";
    }
    if (error == 0) {
      // let format_date = send notification part
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

let API_updateUserFullTimeSheetStatus = async (
  userid,
  monday,
  status,
  models
) => {
  try {
    let result = await updateUserFullTimeSheetStatus(
      userid,
      monday,
      status,
      models
    );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  API_updateUserFullTimeSheetStatus,
  API_updateUserTimeSheetStatus,
  API_getUserSubmittedTimesheet,
  API_pendingTimeSheets,
  API_submitUserTimeSheet,
  API_getUserTimeSheet,
  API_userTimeSheetEntry,
  //   getUserMonthAttendaceComplete,
};
