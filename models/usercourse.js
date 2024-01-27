"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserCourse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserCourse.belongsTo(models.User, {
        foreignKey: "UserId",
      });
      UserCourse.belongsTo(models.User, {
        foreignKey: "CourseId",
      });
      // define association here
    }

    static getMyCourse(UserId) {
      return this.findAll({
        where: {
          UserId: UserId,
        },
      });
    }
  }
  UserCourse.init(
    {
      enroll: DataTypes.BOOLEAN,
      CourseId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserCourse",
    },
  );
  return UserCourse;
};
