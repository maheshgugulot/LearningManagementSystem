"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Chapter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Chapter.belongsTo(models.Course);
      Chapter.hasMany(models.Page);
      // define association here
    }
    static addChapter({ title, description, CourseId }) {
      return this.create({
        title: title,
        description,
        CourseId,
      });
    }
    static getChapter() {
      return this.findAll();
    }
  }
  Chapter.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      CourseId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Chapter",
    },
  );
  return Chapter;
};
