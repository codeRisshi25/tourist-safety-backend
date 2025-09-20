const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Tourist extends Model {
    static associate(models) {
      // define association here
    }
  }
  Tourist.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nationality: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      kycId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      emergencyContact: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      safetyScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 100,
      },
      safetyDetails: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      isFirstTimeLogin: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Tourist",
      tableName: "tourists",
    }
  );
  return Tourist;
};
