'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Location.belongsTo(models.Tourist, {
        foreignKey: 'touristId',
        as: 'tourist'
      });
    }
  }
  Location.init({
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    touristId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};