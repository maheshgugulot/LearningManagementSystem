'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Page extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Page.belongsTo(models.Chapter);
      // define association here
    }
    static addPage({content,completed,ChapterId}){
      return this.create({
        content,
        completed : false,
        ChapterId
      })
    }
    static getPage(){
      return this.findAll();

    }
}
  Page.init({
    content: DataTypes.STRING, 
    completed: DataTypes.BOOLEAN,
    ChapterId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Page',
  });
  return Page;
};