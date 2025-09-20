"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Zones", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      },
      lng: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      },
      radius: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("geofenced", "highRisk", "lowRisk"),
        allowNull: false,
      },
      penalty_bonus: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Zones");
  },
};
