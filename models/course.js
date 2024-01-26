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
      Course.belongsToMany(models.User, { through: 'UserCourse' });
      Course.belongsToMany(models.User, { through: 'UserPage' });

   }
   static addCourse({title}){
    return this.create({
      title ,
    })
  }
  static getCourse(){
    return this.findAll({
      order: [['createdAt', 'DESC']],
    });
  }
  static findById(courseId) {
    return this.findByPk(courseId);
  }
  
}
  Course.init({
    title: DataTypes.STRING,
    }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};