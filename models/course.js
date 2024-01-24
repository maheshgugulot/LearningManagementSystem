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
      Course.belongsTo(models.User, {
        foreignKey: "userId",
      });
   }
   static addCourse({title}){
    return this.create({
      title ,
      enroll : false
    })
  }
  static getCourse(){
    return this.findAll({
      order: [['createdAt', 'DESC']],
    });
  }
  static getMyCourse(){
    return this.findAll({
      where:{
        enroll:true
      },
      order: [['createdAt', 'DESC']],
    });
  }
  static findById(courseId) {
    return this.findByPk(courseId);
  }
  
}
  Course.init({
    title: DataTypes.STRING,
    enroll : DataTypes.BOOLEAN,
    userId : DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};