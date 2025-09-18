// CREATE TABLE itineraries (
//     id BIGSERIAL PRIMARY KEY,
//     tourist_id UUID REFERENCES tourists(id) ON DELETE CASCADE,
//     trip_name TEXT NOT NULL,
//     start_date DATE NOT NULL,
//     end_date DATE NOT NULL,
//     details JSONB, -- Array of {day, location, notes}
//     created_at TIMESTAMPTZ DEFAULT now()
// );

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Itinerary extends Model {
    static associate(models) {}
  }

  Itinerary.init(
    {
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
          model: "tourists",
          key: "id",
        },
      },
      tripName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      details: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
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
      modelName: "Itinerary",
      tableName: "itineraries",
      underscored: true,
      timestamps: false,
    }
  );

  return Itinerary;
};
