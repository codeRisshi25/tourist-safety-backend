'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Alert extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Alert.belongsTo(models.Tourist, { foreignKey: 'touristId' });
      Alert.belongsTo(models.GeofencedZone, { foreignKey: 'zoneId' });
      Alert.belongsTo(models.Authority, { as: 'resolver', foreignKey: 'resolvedBy' });
    }
  }
  Alert.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    touristId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    zoneId: DataTypes.INTEGER,
    alertType: {
      type: DataTypes.ENUM('panic', 'geofence_entry', 'inactivity', 'ai_anomaly', 'health_vital'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'acknowledged', 'resolved', 'false_alarm'),
      defaultValue: 'active'
    },
    location: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: false
    },
    details: DataTypes.JSONB,
    resolvedAt: DataTypes.DATE,
    resolvedBy: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'Alert',
    tableName: 'alerts',
    timestamps: true
  });
  return Alert;
};
