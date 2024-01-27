"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("UserPages", "PageId", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("UserPages", {
      fields: ["PageId"],
      type: "foreign key",
      references: {
        table: "Pages",
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

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("UserPages", "PageId");

    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
