import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class BlockchainId extends Model {
    static associate(models) {
      // define association here
    }
  }
  BlockchainId.init({
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
    blockchainAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
    modelName: 'BlockchainId',
    tableName: 'BlockchainIds',
  });
  return BlockchainId;
};
