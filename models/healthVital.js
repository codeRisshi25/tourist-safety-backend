import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
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
        model: 'Tourists',
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
    tableName: 'HealthVitals',
  });
  return HealthVital;
};
