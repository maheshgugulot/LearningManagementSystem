"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserPage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserPage.belongsTo(models.User, {
        foreignKey: "UserId",
      });
      UserPage.belongsTo(models.Page, {
        foreignKey: "CourseId",
      });
      UserPage.belongsTo(models.Page, {
        foreignKey: "PageId",
      });
      // define association here
    }
  }
  UserPage.init(
    {
      completed: DataTypes.BOOLEAN,
      PageId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
      CourseId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserPage",
    },
  );
  return UserPage;
};
