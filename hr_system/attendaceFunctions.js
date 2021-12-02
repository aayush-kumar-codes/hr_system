const md5=require("md5")
const jwt = require("jsonwebtoken");
const secret = require("./config.json");
const {Op,QueryTypes, json } = require("sequelize");
const db = require("./db");
const { sequelize } = require("./db");
// const{getUserMonthAttendace}=require("./leavesFunctions")

module.exports={
    getUserMonthAttendaceComplete
}