'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Zone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Zone.init({
    name: DataTypes.STRING,
    lat: DataTypes.DECIMAL(10, 7),
    lng: DataTypes.DECIMAL(10, 7),
    radius: DataTypes.DECIMAL(5, 2),
    type: DataTypes.ENUM('geofenced', 'highRisk', 'lowRisk'),
    penalty_bonus: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Zone',
  });
  return Zone;
};