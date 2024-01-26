'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("UserPages", "UserId", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("UserPages", {
      fields: ["UserId"],
      type: "foreign key",
      references: {
        table: "Users",
        field: "id",
      },
    });
    
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("UserPages", "UserId");

    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
