'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Course.hasMany(models.Chapter);
   }
   static addCourse({title}){
    return this.create({
      title : title
    })
  }
  static getCourse(){
    return this.findAll();
  }
  static findById(courseId) {
    return this.findByPk(courseId);
  }
}
  Course.init({
    title: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};