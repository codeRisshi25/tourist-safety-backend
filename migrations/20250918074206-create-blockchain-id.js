'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blockchain_ids', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      touristId: {
        type: Sequelize.UUID,
        unique: true,
        allowNull: false,
        references: {
          model: 'tourists',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      walletAddress: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      issuanceTxHash: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      smartContractAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      issuedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('blockchain_ids');
  },
};
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
