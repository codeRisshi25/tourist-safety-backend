const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class IotDevice extends Model {
    static associate(models) {
      // define association here
    }
  }
  IotDevice.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    touristId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tourists',
        key: 'id',
      },
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    deviceType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'IotDevice',
    tableName: 'iot_devices',
  });
  return IotDevice;
};
