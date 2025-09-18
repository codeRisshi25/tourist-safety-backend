const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class HealthVital extends Model {
    static associate(models) {
      // define association here
    }
  }
  HealthVital.init({
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
    heartRate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bodyTemperature: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    bloodPressure: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
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
    modelName: 'HealthVital',
    tableName: 'health_vitals',
  });
  return HealthVital;
};
