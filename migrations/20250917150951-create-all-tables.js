'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tourists', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
      },
      nationality: Sequelize.STRING,
      kycData: Sequelize.JSONB,
      emergencyContact: Sequelize.JSONB,
      safetyScore: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('itineraries', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      touristId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tourists',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      tripName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      details: Sequelize.JSONB,
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('location_pings', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      touristId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tourists',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      location: {
        type: Sequelize.GEOMETRY('POINT', 4326),
        allowNull: false,
      },
      accuracyMeters: Sequelize.FLOAT,
      speedMps: Sequelize.FLOAT,
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('authorities', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      precinctId: Sequelize.INTEGER,
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('geofenced_zones', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      zoneName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      zoneType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      area: {
        type: Sequelize.GEOMETRY('POLYGON', 4326),
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdBy: {
        type: Sequelize.UUID,
        references: {
          model: 'authorities',
          key: 'id',
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('alerts', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      touristId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tourists',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      zoneId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'geofenced_zones',
          key: 'id',
        },
      },
      alertType: {
        type: Sequelize.ENUM('panic', 'geofence_entry', 'inactivity', 'ai_anomaly', 'health_vital'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'acknowledged', 'resolved', 'false_alarm'),
        defaultValue: 'active',
      },
      location: {
        type: Sequelize.GEOMETRY('POINT', 4326),
        allowNull: false,
      },
      details: Sequelize.JSONB,
      resolvedAt: Sequelize.DATE,
      resolvedBy: {
        type: Sequelize.UUID,
        references: {
          model: 'authorities',
          key: 'id',
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('blockchain_ids', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      touristId: {
        type: Sequelize.UUID,
        unique: true,
        allowNull: false,
        references: {
          model: 'tourists',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      walletAddress: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      issuanceTxHash: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      smartContractAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      issuedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('iot_devices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      deviceUid: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      touristId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tourists',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      deviceType: Sequelize.STRING,
      batteryLevel: Sequelize.INTEGER,
      lastSeen: Sequelize.DATE,
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('health_vitals', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      deviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'iot_devices',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      heartRate: Sequelize.INTEGER,
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('health_vitals');
    await queryInterface.dropTable('iot_devices');
    await queryInterface.dropTable('blockchain_ids');
    await queryInterface.dropTable('alerts');
    await queryInterface.dropTable('geofenced_zones');
    await queryInterface.dropTable('authorities');
    await queryInterface.dropTable('location_pings');
    await queryInterface.dropTable('itineraries');
    await queryInterface.dropTable('tourists');
  },
};
