'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BlockchainId extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      BlockchainId.belongsTo(models.Tourist, { foreignKey: 'touristId' });
    }
  }
  BlockchainId.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    touristId: {
      type: DataTypes.UUID,
      unique: true,
      allowNull: false
    },
    walletAddress: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    issuanceTxHash: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    smartContractAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    issuedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'BlockchainId',
    tableName: 'blockchain_ids',
    timestamps: false
  });
  return BlockchainId;
};
