'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('iot_devices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      deviceUid: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      touristId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tourists',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      deviceType: {
        type: Sequelize.STRING,
      },
      batteryLevel: {
        type: Sequelize.INTEGER,
      },
      lastSeen: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('iot_devices');
  },
};
