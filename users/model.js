const Sequelize = require("sequelize");

const db = require("../db");

const User = db.define("user", {
  name: { type: Sequelize.STRING },
  picture: { type: Sequelize.STRING }
});

module.exports = User;
