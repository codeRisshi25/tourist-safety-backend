'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Itinerary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Itinerary.belongsTo(models.Tourist, { foreignKey: 'touristId' });
    }
  }
  Itinerary.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    touristId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    tripName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    details: DataTypes.JSONB,
  }, {
    sequelize,
    modelName: 'Itinerary',
    tableName: 'itineraries',
    timestamps: true
  });
  return Itinerary;
};
