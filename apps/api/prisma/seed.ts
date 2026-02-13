import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.airport.createMany({
    data: [
      { iata: 'LIM', icao: 'LIMX', name: 'Linate Metro', city: 'Milan', country: 'IT', lat: 45.4494, lon: 9.2783, runwayLengthM: 2442, slotCapacity: 260, landingFee: 1800, passengerFee: 16, fuelPriceBase: 0.89, demandBase: 0.78 },
      { iata: 'RMA', icao: 'RMAX', name: 'Roma Centrale', city: 'Rome', country: 'IT', lat: 41.8003, lon: 12.2389, runwayLengthM: 3900, slotCapacity: 320, landingFee: 2200, passengerFee: 18, fuelPriceBase: 0.91, demandBase: 0.84 },
      { iata: 'PAR', icao: 'PARX', name: 'Paris Meridian', city: 'Paris', country: 'FR', lat: 49.0097, lon: 2.5479, runwayLengthM: 4215, slotCapacity: 360, landingFee: 2400, passengerFee: 20, fuelPriceBase: 0.95, demandBase: 0.87 },
      { iata: 'LON', icao: 'LONX', name: 'London Crown', city: 'London', country: 'UK', lat: 51.47, lon: -0.4543, runwayLengthM: 3902, slotCapacity: 380, landingFee: 2500, passengerFee: 24, fuelPriceBase: 0.99, demandBase: 0.9 },
      { iata: 'BER', icao: 'BERX', name: 'Berlin Gate', city: 'Berlin', country: 'DE', lat: 52.3667, lon: 13.5033, runwayLengthM: 3600, slotCapacity: 300, landingFee: 2000, passengerFee: 17, fuelPriceBase: 0.93, demandBase: 0.76 },
      { iata: 'MAD', icao: 'MADX', name: 'Madrid Sol', city: 'Madrid', country: 'ES', lat: 40.4983, lon: -3.5676, runwayLengthM: 4400, slotCapacity: 340, landingFee: 2150, passengerFee: 17.5, fuelPriceBase: 0.88, demandBase: 0.81 },
      { iata: 'NYC', icao: 'NYCX', name: 'New York Harbor', city: 'New York', country: 'US', lat: 40.6413, lon: -73.7781, runwayLengthM: 4441, slotCapacity: 420, landingFee: 3100, passengerFee: 28, fuelPriceBase: 1.04, demandBase: 0.95 },
      { iata: 'DXB', icao: 'DXBX', name: 'Dubai Oasis', city: 'Dubai', country: 'AE', lat: 25.2532, lon: 55.3657, runwayLengthM: 4400, slotCapacity: 410, landingFee: 2800, passengerFee: 22, fuelPriceBase: 0.84, demandBase: 0.89 },
      { iata: 'SIN', icao: 'SINX', name: 'Singapore Marina', city: 'Singapore', country: 'SG', lat: 1.3644, lon: 103.9915, runwayLengthM: 4000, slotCapacity: 390, landingFee: 2950, passengerFee: 23, fuelPriceBase: 0.87, demandBase: 0.9 },
      { iata: 'TYO', icao: 'TYOX', name: 'Tokyo Bay', city: 'Tokyo', country: 'JP', lat: 35.5494, lon: 139.7798, runwayLengthM: 3360, slotCapacity: 430, landingFee: 3200, passengerFee: 27, fuelPriceBase: 1.01, demandBase: 0.93 },
    ],
    skipDuplicates: true,
  });

  await prisma.aircraftModel.createMany({
    data: [
      { code: 'SW-90', manufacturer: 'Skyward', name: 'SW Regional 90', seatsEconomy: 82, seatsBusiness: 8, cargoKg: 6000, rangeKm: 2800, cruiseKmh: 760, fuelBurnKgKm: 2.3, turnaroundMin: 35, maintenanceCostHr: 420, purchasePrice: 22000000, leasePerDay: 17000 },
      { code: 'SW-180', manufacturer: 'Skyward', name: 'SW Narrow 180', seatsEconomy: 162, seatsBusiness: 18, cargoKg: 11000, rangeKm: 5600, cruiseKmh: 820, fuelBurnKgKm: 3.7, turnaroundMin: 45, maintenanceCostHr: 660, purchasePrice: 76000000, leasePerDay: 52000 },
      { code: 'SW-240', manufacturer: 'Skyward', name: 'SW Narrow 240', seatsEconomy: 216, seatsBusiness: 24, cargoKg: 14000, rangeKm: 6400, cruiseKmh: 835, fuelBurnKgKm: 4.5, turnaroundMin: 50, maintenanceCostHr: 780, purchasePrice: 97000000, leasePerDay: 68000 },
      { code: 'OR-310', manufacturer: 'Orion', name: 'OR Twin 310', seatsEconomy: 270, seatsBusiness: 40, cargoKg: 24000, rangeKm: 12500, cruiseKmh: 900, fuelBurnKgKm: 6.8, turnaroundMin: 70, maintenanceCostHr: 1240, purchasePrice: 215000000, leasePerDay: 155000 },
      { code: 'OR-360', manufacturer: 'Orion', name: 'OR Twin 360', seatsEconomy: 312, seatsBusiness: 48, cargoKg: 28000, rangeKm: 13800, cruiseKmh: 905, fuelBurnKgKm: 7.4, turnaroundMin: 80, maintenanceCostHr: 1420, purchasePrice: 268000000, leasePerDay: 198000 },
      { code: 'AT-520F', manufacturer: 'Aether', name: 'AT Freighter 520', seatsEconomy: 20, seatsBusiness: 0, cargoKg: 65000, rangeKm: 8600, cruiseKmh: 850, fuelBurnKgKm: 7.1, turnaroundMin: 95, maintenanceCostHr: 1610, purchasePrice: 186000000, leasePerDay: 141000 },
    ],
    skipDuplicates: true,
  });

  await prisma.economyConfig.createMany({
    data: [
      { key: 'priceSensitivity', value: { value: 0.35 } },
      { key: 'reputationWeight', value: { value: 0.2 } },
      { key: 'frequencyWeight', value: { value: 0.12 } },
      { key: 'baseDemandCoeff', value: { value: 0.000012 } },
      { key: 'crewCostPerFlightHour', value: { value: 1800 } },
    ],
    skipDuplicates: true,
  });
}

main().finally(() => prisma.$disconnect());
