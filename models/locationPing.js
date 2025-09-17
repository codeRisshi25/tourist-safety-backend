'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LocationPing extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LocationPing.belongsTo(models.Tourist, { foreignKey: 'touristId' });
    }
  }
  LocationPing.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    touristId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    location: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: false
    },
    accuracyMeters: DataTypes.FLOAT,
    speedMps: DataTypes.FLOAT,
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'LocationPing',
    tableName: 'location_pings',
    timestamps: false
  });
  return LocationPing;
};
