'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tourist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tourist.hasMany(models.Itinerary, { foreignKey: 'touristId' });
      Tourist.hasMany(models.LocationPing, { foreignKey: 'touristId' });
      Tourist.hasMany(models.Alert, { foreignKey: 'touristId' });
      Tourist.hasOne(models.BlockchainId, { foreignKey: 'touristId' });
      Tourist.hasMany(models.IotDevice, { foreignKey: 'touristId' });
    }
  }
  Tourist.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    nationality: DataTypes.STRING,
    kycData: DataTypes.JSONB,
    emergencyContact: DataTypes.JSONB,
    safetyScore: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Tourist',
    tableName: 'tourists',
    timestamps: true
  });
  return Tourist;
};
