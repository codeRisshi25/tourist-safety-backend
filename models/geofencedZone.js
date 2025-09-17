'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GeofencedZone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GeofencedZone.hasMany(models.Alert, { foreignKey: 'zoneId' });
      GeofencedZone.belongsTo(models.Authority, { as: 'creator', foreignKey: 'createdBy' });
    }
  }
  GeofencedZone.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    zoneName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    zoneType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    area: {
      type: DataTypes.GEOMETRY('POLYGON', 4326),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdBy: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'GeofencedZone',
    tableName: 'geofenced_zones',
    timestamps: true
  });
  return GeofencedZone;
};
