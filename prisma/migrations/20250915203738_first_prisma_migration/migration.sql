-- CreateEnum
CREATE TYPE "public"."alert_type" AS ENUM ('panic', 'geofence_entry', 'inactivity', 'ai_anomaly', 'health_vital');

-- CreateEnum
CREATE TYPE "public"."alert_status" AS ENUM ('active', 'acknowledged', 'resolved', 'false_alarm');

-- CreateTable
CREATE TABLE "public"."tourist" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "nationality" TEXT,
    "kycData" JSONB,
    "emergencyContact" JSONB,
    "safetyScore" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tourist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."itinerary" (
    "id" BIGSERIAL NOT NULL,
    "touristId" UUID NOT NULL,
    "tripName" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."location_ping" (
    "id" BIGSERIAL NOT NULL,
    "touristId" UUID NOT NULL,
    "location" geometry(Point,4326) NOT NULL,
    "accuracyMeters" DOUBLE PRECISION,
    "speedMps" DOUBLE PRECISION,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "location_ping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."geofenced_zone" (
    "id" SERIAL NOT NULL,
    "zoneName" TEXT NOT NULL,
    "zoneType" TEXT NOT NULL,
    "area" geometry(Polygon,4326) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" UUID,

    CONSTRAINT "geofenced_zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alert" (
    "id" BIGSERIAL NOT NULL,
    "touristId" UUID NOT NULL,
    "zoneId" INTEGER,
    "alertType" "public"."alert_type" NOT NULL,
    "status" "public"."alert_status" NOT NULL DEFAULT 'active',
    "location" geometry(Point,4326) NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMPTZ(6),
    "resolvedBy" UUID,

    CONSTRAINT "alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."authority" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "precinctId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "authority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blockchain_id" (
    "id" BIGSERIAL NOT NULL,
    "touristId" UUID NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "issuanceTxHash" TEXT NOT NULL,
    "smartContractAddress" TEXT NOT NULL,
    "issuedAt" TIMESTAMPTZ(6) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "blockchain_id_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."iot_device" (
    "id" SERIAL NOT NULL,
    "deviceUid" TEXT NOT NULL,
    "touristId" UUID NOT NULL,
    "deviceType" TEXT,
    "batteryLevel" INTEGER,
    "lastSeen" TIMESTAMPTZ(6),

    CONSTRAINT "iot_device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."health_vital" (
    "id" BIGSERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "heartRate" INTEGER,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "health_vital_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tourist_phoneNumber_key" ON "public"."tourist"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "tourist_email_key" ON "public"."tourist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "authority_email_key" ON "public"."authority"("email");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_id_touristId_key" ON "public"."blockchain_id"("touristId");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_id_walletAddress_key" ON "public"."blockchain_id"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_id_issuanceTxHash_key" ON "public"."blockchain_id"("issuanceTxHash");

-- CreateIndex
CREATE UNIQUE INDEX "iot_device_deviceUid_key" ON "public"."iot_device"("deviceUid");

-- AddForeignKey
ALTER TABLE "public"."itinerary" ADD CONSTRAINT "itinerary_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "public"."tourist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."location_ping" ADD CONSTRAINT "location_ping_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "public"."tourist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."geofenced_zone" ADD CONSTRAINT "geofenced_zone_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."authority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alert" ADD CONSTRAINT "alert_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "public"."tourist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alert" ADD CONSTRAINT "alert_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."geofenced_zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alert" ADD CONSTRAINT "alert_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "public"."authority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blockchain_id" ADD CONSTRAINT "blockchain_id_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "public"."tourist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."iot_device" ADD CONSTRAINT "iot_device_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "public"."tourist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."health_vital" ADD CONSTRAINT "health_vital_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."iot_device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
