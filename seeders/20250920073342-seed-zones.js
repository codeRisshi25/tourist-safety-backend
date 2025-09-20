"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Zones",
      [
        {
          name: "Military Base Alpha",
          lat: 48.8566,
          lng: 2.3522,
          radius: 2.0,
          type: "geofenced",
          penalty_bonus: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Downtown Crime Zone",
          lat: 40.7128,
          lng: -74.006,
          radius: 1.5,
          type: "highRisk",
          penalty_bonus: -40,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Eiffel Tower Area",
          lat: 48.8584,
          lng: 2.2945,
          radius: 0.5,
          type: "lowRisk",
          penalty_bonus: -10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Zones", null, {});
  },
};
