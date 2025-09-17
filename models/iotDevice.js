'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class IotDevice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      IotDevice.belongsTo(models.Tourist, { foreignKey: 'touristId' });
      IotDevice.hasMany(models.HealthVital, { foreignKey: 'deviceId' });
    }
  }
  IotDevice.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    deviceUid: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    touristId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    deviceType: DataTypes.STRING,
    batteryLevel: DataTypes.INTEGER,
    lastSeen: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'IotDevice',
    tableName: 'iot_devices',
    timestamps: true
  });
  return IotDevice;
};
