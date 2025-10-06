import { PrismaClient, VehicleType, VehicleCategory, VehicleStatus, AmenityCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@triptogether.com' },
    update: {},
    create: {
      email: 'admin@triptogether.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  })

  // Create test users
  const testUserPassword = await bcrypt.hash('test123', 12)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@triptogether.com' },
    update: {},
    create: {
      email: 'test@triptogether.com',
      name: 'Test User',
      password: testUserPassword,
      phone: '+1234567890',
      role: 'USER',
      isVerified: true,
    },
  })

  // Create Vivek Bukka account
  const vivekPassword = await bcrypt.hash('vivek123', 12)
  const vivekUser = await prisma.user.upsert({
    where: { email: 'vivek.bukka@triptogether.com' },
    update: {},
    create: {
      email: 'vivek.bukka@triptogether.com',
      name: 'Vivek Bukka',
      password: vivekPassword,
      role: 'USER',
      isVerified: true,
      phone: '+91 98765 43210',
    },
  })

  // Create additional test accounts
  const demoPassword = await bcrypt.hash('demo123', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@triptogether.com' },
    update: {},
    create: {
      email: 'demo@triptogether.com',
      name: 'Demo User',
      password: demoPassword,
      role: 'USER',
      isVerified: true,
      phone: '+91 87654 32109',
    },
  })

  // Create customer service account
  const customerServicePassword = await bcrypt.hash('support123', 12)
  const customerServiceUser = await prisma.user.upsert({
    where: { email: 'support@triptogether.com' },
    update: {},
    create: {
      email: 'support@triptogether.com',
      name: 'Customer Support',
      password: customerServicePassword,
      role: 'ADMIN',
      isVerified: true,
      phone: '+91 1800 123 4567',
    },
  })

  // Create driver account
  const driverPassword = await bcrypt.hash('driver123', 12)
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@triptogether.com' },
    update: {},
    create: {
      email: 'driver@triptogether.com',
      name: 'Rajesh Kumar',
      password: driverPassword,
      role: 'USER',
      isVerified: true,
      phone: '+91 98765 12345',
    },
  })

  // Create vehicle amenities
  const amenities: Array<{
    name: string
    category: AmenityCategory
    priceModifier: number
    description: string
  }> = [
    // Climate Control
    { name: 'Air Conditioning', category: AmenityCategory.CLIMATE_CONTROL, priceModifier: 10.0, description: 'Climate controlled environment with cooling' },
    { name: 'Heating', category: AmenityCategory.CLIMATE_CONTROL, priceModifier: 8.0, description: 'Heating system for winter comfort' },
    
    // Connectivity
    { name: 'WiFi', category: AmenityCategory.CONNECTIVITY, priceModifier: 20.0, description: 'High-speed internet access' },
    { name: 'USB Charging Ports', category: AmenityCategory.CONNECTIVITY, priceModifier: 5.0, description: 'USB ports for device charging' },
    { name: 'Power Outlets', category: AmenityCategory.CONNECTIVITY, priceModifier: 8.0, description: '220V power outlets' },
    
    // Entertainment
    { name: 'Audio System', category: AmenityCategory.ENTERTAINMENT, priceModifier: 12.0, description: 'Premium sound system' },
    { name: 'TV Screens', category: AmenityCategory.ENTERTAINMENT, priceModifier: 25.0, description: 'Individual TV screens' },
    { name: 'Streaming Service', category: AmenityCategory.ENTERTAINMENT, priceModifier: 15.0, description: 'Access to streaming platforms' },
    
    // Comfort
    { name: 'Reclining Seats', category: AmenityCategory.COMFORT, priceModifier: 18.0, description: 'Adjustable reclining seats' },
    { name: 'Extra Legroom', category: AmenityCategory.COMFORT, priceModifier: 22.0, description: 'Additional legroom space' },
    { name: 'Premium Seating', category: AmenityCategory.COMFORT, priceModifier: 30.0, description: 'Luxury seating with premium materials' },
    { name: 'Restroom', category: AmenityCategory.COMFORT, priceModifier: 35.0, description: 'Onboard restroom facilities' },
    
    // Storage
    { name: 'Luggage Compartment', category: AmenityCategory.STORAGE, priceModifier: 10.0, description: 'Secure luggage storage' },
    { name: 'Overhead Bins', category: AmenityCategory.STORAGE, priceModifier: 8.0, description: 'Overhead storage compartments' },
    
    // Accessibility
    { name: 'Wheelchair Access', category: AmenityCategory.ACCESSIBILITY, priceModifier: 0.0, description: 'Wheelchair accessible entry and seating' },
    { name: 'Priority Seating', category: AmenityCategory.ACCESSIBILITY, priceModifier: 0.0, description: 'Reserved seating for elderly and disabled' },
    
    // Safety
    { name: 'GPS Tracking', category: AmenityCategory.SAFETY, priceModifier: 5.0, description: 'Real-time GPS tracking' },
    { name: 'Emergency Kit', category: AmenityCategory.SAFETY, priceModifier: 3.0, description: 'First aid and emergency equipment' },

    // Bike-specific amenities
    { name: 'Helmet Included', category: AmenityCategory.SAFETY, priceModifier: 0.0, description: 'Safety helmet provided with rental' },
    { name: 'Mobile Holder', category: AmenityCategory.CONNECTIVITY, priceModifier: 2.0, description: 'Secure mobile phone holder' },
    { name: 'Under Seat Storage', category: AmenityCategory.STORAGE, priceModifier: 3.0, description: 'Storage compartment under seat' },
    { name: 'Electric Start', category: AmenityCategory.COMFORT, priceModifier: 5.0, description: 'Electric start system for easy ignition' },
    { name: 'LED Headlight', category: AmenityCategory.SAFETY, priceModifier: 8.0, description: 'Bright LED headlight for better visibility' },
    { name: 'Digital Console', category: AmenityCategory.ENTERTAINMENT, priceModifier: 10.0, description: 'Digital instrument cluster with trip computer' },
    { name: 'ABS Brakes', category: AmenityCategory.SAFETY, priceModifier: 15.0, description: 'Anti-lock braking system for safer stops' },
    { name: 'Disc Brakes', category: AmenityCategory.SAFETY, priceModifier: 8.0, description: 'Disc brake system for better stopping power' },
    { name: 'Alloy Wheels', category: AmenityCategory.COMFORT, priceModifier: 12.0, description: 'Lightweight alloy wheels for better performance' },
    { name: 'Fuel Injection', category: AmenityCategory.COMFORT, priceModifier: 10.0, description: 'Fuel injection system for better efficiency' },
  ]

  for (const amenity of amenities) {
    await prisma.vehicleAmenity.upsert({
      where: { name: amenity.name },
      update: {},
      create: amenity,
    })
  }

  // Create sample vehicles
  const vehicles = [
    // Cabs (Indian vehicles)
    {
      name: 'Maruti Suzuki Dzire - Economy',
      description: 'Fuel-efficient and comfortable sedan perfect for city rides and airport transfers',
      type: VehicleType.CAB,
      category: VehicleCategory.ECONOMY_CAB,
      capacity: 4,
      doors: 4,
      transmission: 'manual',
      fuelType: 'petrol',
      hourlyRate: 120.0, // ₹120 per hour
      dailyRate: 1800.0, // ₹1800 per day
      weeklyRate: 11000.0, // ₹11000 per week
      make: 'Maruti Suzuki',
      model: 'Dzire',
      year: 2023,
      color: 'White',
      licensePlate: 'DL-01-AB-1234',
      features: JSON.stringify(['Air Conditioning', 'Music System', 'GPS Navigation', 'Mobile Charging']),
      images: JSON.stringify(['/images/vehicles/maruti-dzire.jpg']),
      location: 'Connaught Place, Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    {
      name: 'Honda City - Standard',
      description: 'Comfortable mid-size sedan with modern amenities and excellent ride quality',
      type: VehicleType.CAB,
      category: VehicleCategory.STANDARD_CAB,
      capacity: 4,
      doors: 4,
      transmission: 'automatic',
      fuelType: 'petrol',
      hourlyRate: 180.0, // ₹180 per hour
      dailyRate: 2800.0, // ₹2800 per day
      weeklyRate: 18000.0, // ₹18000 per week
      make: 'Honda',
      model: 'City',
      year: 2023,
      color: 'Black',
      licensePlate: 'DL-02-CD-5678',
      features: JSON.stringify(['Air Conditioning', 'Leather Seats', 'Premium Audio', 'GPS Navigation']),
      images: JSON.stringify(['/images/vehicles/honda-city.jpg']),
      location: 'Karol Bagh, Delhi',
      latitude: 28.6519,
      longitude: 77.1909,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    {
      name: 'Toyota Innova Crysta - Premium',
      description: 'Spacious and comfortable MPV with premium features perfect for family trips',
      type: VehicleType.CAB,
      category: VehicleCategory.PREMIUM_CAB,
      capacity: 7,
      doors: 4,
      transmission: 'automatic',
      fuelType: 'diesel',
      hourlyRate: 250.0, // ₹250 per hour
      dailyRate: 4000.0, // ₹4000 per day
      weeklyRate: 25000.0, // ₹25000 per week
      make: 'Toyota',
      model: 'Innova Crysta',
      year: 2023,
      color: 'Silver',
      licensePlate: 'DL-03-EF-9012',
      features: JSON.stringify(['Climate Control', 'Leather Seats', 'Premium Audio', 'GPS Navigation', 'Captain Seats']),
      images: JSON.stringify(['/images/vehicles/toyota-innova.jpg']),
      location: 'Gurgaon, Haryana',
      latitude: 28.4595,
      longitude: 77.0266,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    {
      name: 'Mercedes E-Class - Luxury',
      description: 'Ultimate luxury sedan with professional chauffeur service',
      type: VehicleType.CAB,
      category: VehicleCategory.LUXURY_CAB,
      capacity: 4,
      doors: 4,
      transmission: 'automatic',
      fuelType: 'petrol',
      hourlyRate: 400.0, // ₹400 per hour
      dailyRate: 6000.0, // ₹6000 per day
      weeklyRate: 38000.0, // ₹38000 per week
      make: 'Mercedes-Benz',
      model: 'E-Class',
      year: 2024,
      color: 'Black',
      licensePlate: 'DL-04-GH-3456',
      features: JSON.stringify(['Climate Control', 'Massage Seats', 'Premium Audio', 'GPS Navigation', 'Sunroof', 'Chauffeur']),
      images: JSON.stringify(['/images/vehicles/mercedes-eclass.jpg']),
      location: 'Aerocity, Delhi',
      latitude: 28.5562,
      longitude: 77.1180,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    
    // Buses (Indian vehicles)
    {
      name: 'Tata Winger - Mini Bus',
      description: 'Compact bus perfect for small groups, school trips and corporate outings',
      type: VehicleType.BUS,
      category: VehicleCategory.MINI_BUS,
      capacity: 12,
      doors: 2,
      transmission: 'manual',
      fuelType: 'diesel',
      hourlyRate: 200.0, // ₹200 per hour
      dailyRate: 3000.0, // ₹3000 per day
      weeklyRate: 18000.0, // ₹18000 per week
      make: 'Tata',
      model: 'Winger',
      year: 2022,
      color: 'White',
      licensePlate: 'HR-26-AB-1234',
      features: JSON.stringify(['Air Conditioning', 'Music System', 'GPS Navigation', 'Push Back Seats']),
      images: JSON.stringify(['/images/vehicles/tata-winger.jpg']),
      location: 'IGI Airport, Delhi',
      latitude: 28.5665,
      longitude: 77.1031,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    {
      name: 'Ashok Leyland Stile - Standard Bus',
      description: 'Comfortable bus for medium-sized groups with modern amenities and safety features',
      type: VehicleType.BUS,
      category: VehicleCategory.STANDARD_BUS,
      capacity: 25,
      doors: 2,
      transmission: 'manual',
      fuelType: 'diesel',
      hourlyRate: 300.0, // ₹300 per hour
      dailyRate: 4500.0, // ₹4500 per day
      weeklyRate: 28000.0, // ₹28000 per week
      make: 'Ashok Leyland',
      model: 'Stile',
      year: 2023,
      color: 'White',
      licensePlate: 'UP-32-CD-5678',
      features: JSON.stringify(['Air Conditioning', 'Music System', 'USB Charging', 'GPS Navigation', 'First Aid Kit']),
      images: JSON.stringify(['/images/vehicles/ashok-leyland-stile.jpg']),
      location: 'Noida, Uttar Pradesh',
      latitude: 28.5355,
      longitude: 77.3910,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    {
      name: 'Volvo Multi-Axle - Large Bus',
      description: 'Spacious coach bus for large groups with premium amenities and comfort',
      type: VehicleType.BUS,
      category: VehicleCategory.LARGE_BUS,
      capacity: 45,
      doors: 2,
      transmission: 'automatic',
      fuelType: 'diesel',
      hourlyRate: 450.0, // ₹450 per hour
      dailyRate: 7000.0, // ₹7000 per day
      weeklyRate: 45000.0, // ₹45000 per week
      make: 'Volvo',
      model: 'Multi-Axle',
      year: 2023,
      color: 'Blue',
      licensePlate: 'KA-01-EF-9012',
      features: JSON.stringify(['Climate Control', 'WiFi', 'TV Screens', 'Restroom', 'Reclining Seats', 'GPS Navigation']),
      images: JSON.stringify(['/images/vehicles/volvo-multiaxle.jpg']),
      location: 'Bangalore Bus Terminal, Karnataka',
      latitude: 12.9716,
      longitude: 77.5946,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },

    // Additional Indian vehicles for more cities
    {
      name: 'Hyundai Creta - Premium SUV',
      description: 'Spacious SUV perfect for family trips and outstation travel',
      type: VehicleType.CAB,
      category: VehicleCategory.PREMIUM_CAB,
      capacity: 5,
      doors: 4,
      transmission: 'automatic',
      fuelType: 'petrol',
      hourlyRate: 280.0,
      dailyRate: 4200.0,
      weeklyRate: 26000.0,
      make: 'Hyundai',
      model: 'Creta',
      year: 2023,
      color: 'Red',
      licensePlate: 'MH-01-GH-7890',
      features: JSON.stringify(['Air Conditioning', 'Sunroof', 'Premium Audio', 'GPS Navigation', 'Leather Seats']),
      images: JSON.stringify(['/images/vehicles/hyundai-creta.jpg']),
      location: 'Bandra, Mumbai',
      latitude: 19.0596,
      longitude: 72.8295,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },

    {
      name: 'Mahindra Scorpio - Rugged SUV',
      description: 'Powerful SUV ideal for rough terrains and long distance travel',
      type: VehicleType.CAB,
      category: VehicleCategory.STANDARD_CAB,
      capacity: 7,
      doors: 4,
      transmission: 'manual',
      fuelType: 'diesel',
      hourlyRate: 220.0,
      dailyRate: 3200.0,
      weeklyRate: 20000.0,
      make: 'Mahindra',
      model: 'Scorpio',
      year: 2022,
      color: 'Black',
      licensePlate: 'KA-03-IJ-2345',
      features: JSON.stringify(['Air Conditioning', '4WD', 'Music System', 'GPS Navigation', 'High Ground Clearance']),
      images: JSON.stringify(['/images/vehicles/mahindra-scorpio.jpg']),
      location: 'Electronic City, Bangalore',
      latitude: 12.8456,
      longitude: 77.6603,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },

    {
      name: 'Force Traveller - Large Bus',
      description: 'Reliable bus for group travel and corporate transportation',
      type: VehicleType.BUS,
      category: VehicleCategory.STANDARD_BUS,
      capacity: 20,
      doors: 2,
      transmission: 'manual',
      fuelType: 'diesel',
      hourlyRate: 350.0,
      dailyRate: 5000.0,
      weeklyRate: 32000.0,
      make: 'Force',
      model: 'Traveller',
      year: 2022,
      color: 'White',
      licensePlate: 'TN-09-KL-6789',
      features: JSON.stringify(['Air Conditioning', 'Music System', 'GPS Navigation', 'Push Back Seats', 'First Aid Kit']),
      images: JSON.stringify(['/images/vehicles/force-traveller.jpg']),
      location: 'T. Nagar, Chennai',
      latitude: 13.0827,
      longitude: 80.2707,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },

    // Bikes (Indian two-wheelers)
    {
      name: 'Honda Activa 6G - Scooter',
      description: 'India\'s most trusted scooter with excellent fuel efficiency and comfortable ride',
      type: VehicleType.BIKE,
      category: VehicleCategory.SCOOTER,
      capacity: 2,
      doors: 0,
      transmission: 'automatic',
      fuelType: 'petrol',
      hourlyRate: 80.0,
      dailyRate: 600.0,
      weeklyRate: 3500.0,
      make: 'Honda',
      model: 'Activa 6G',
      year: 2023,
      color: 'Pearl Amazing White',
      licensePlate: 'MH-12-AB-1234',
      features: JSON.stringify(['Electric Start', 'LED Headlight', 'Mobile Charging Socket', 'Under Seat Storage', 'Combi Brake System']),
      images: JSON.stringify(['/images/vehicles/honda-activa.jpg']),
      location: 'Bandra, Mumbai',
      latitude: 19.0596,
      longitude: 72.8295,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    {
      name: 'TVS Jupiter 125 - Scooter',
      description: 'Premium family scooter with advanced features and superior comfort',
      type: VehicleType.BIKE,
      category: VehicleCategory.SCOOTER,
      capacity: 2,
      doors: 0,
      transmission: 'automatic',
      fuelType: 'petrol',
      hourlyRate: 85.0,
      dailyRate: 650.0,
      weeklyRate: 3800.0,
      make: 'TVS',
      model: 'Jupiter 125',
      year: 2023,
      color: 'Starlight Blue',
      licensePlate: 'KA-03-CD-5678',
      features: JSON.stringify(['Smart Connect', 'LED DRL', 'USB Charger', 'External Fuel Fill', 'Telescopic Suspension']),
      images: JSON.stringify(['/images/vehicles/tvs-jupiter.jpg']),
      location: 'Koramangala, Bangalore',
      latitude: 12.9352,
      longitude: 77.6245,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    {
      name: 'Hero Splendor Plus - Standard Bike',
      description: 'Reliable and fuel-efficient motorcycle perfect for daily commuting',
      type: VehicleType.BIKE,
      category: VehicleCategory.STANDARD_BIKE,
      capacity: 2,
      doors: 0,
      transmission: 'manual',
      fuelType: 'petrol',
      hourlyRate: 70.0,
      dailyRate: 500.0,
      weeklyRate: 3000.0,
      make: 'Hero',
      model: 'Splendor Plus',
      year: 2023,
      color: 'Heavy Grey',
      licensePlate: 'DL-8C-EF-9012',
      features: JSON.stringify(['Electric Start', 'Alloy Wheels', 'LED Tail Light', 'Side Stand Indicator', 'Engine Immobilizer']),
      images: JSON.stringify(['/images/vehicles/hero-splendor.jpg']),
      location: 'Connaught Place, Delhi',
      latitude: 28.6315,
      longitude: 77.2167,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    {
      name: 'Bajaj Pulsar NS200 - Sports Bike',
      description: 'High-performance sports bike with aggressive styling and powerful engine',
      type: VehicleType.BIKE,
      category: VehicleCategory.SPORTS_BIKE,
      capacity: 2,
      doors: 0,
      transmission: 'manual',
      fuelType: 'petrol',
      hourlyRate: 150.0,
      dailyRate: 1200.0,
      weeklyRate: 7500.0,
      make: 'Bajaj',
      model: 'Pulsar NS200',
      year: 2023,
      color: 'Burnt Red',
      licensePlate: 'RJ-14-GH-3456',
      features: JSON.stringify(['Liquid Cooling', 'Digital Console', 'LED Headlight', 'ABS', 'Perimeter Frame']),
      images: JSON.stringify(['/images/vehicles/bajaj-pulsar.jpg']),
      location: 'Pink City, Jaipur',
      latitude: 26.9124,
      longitude: 75.7873,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    {
      name: 'Royal Enfield Classic 350 - Cruiser',
      description: 'Iconic cruiser motorcycle with vintage charm and modern reliability',
      type: VehicleType.BIKE,
      category: VehicleCategory.CRUISER_BIKE,
      capacity: 2,
      doors: 0,
      transmission: 'manual',
      fuelType: 'petrol',
      hourlyRate: 200.0,
      dailyRate: 1500.0,
      weeklyRate: 9500.0,
      make: 'Royal Enfield',
      model: 'Classic 350',
      year: 2023,
      color: 'Stealth Black',
      licensePlate: 'PB-10-IJ-7890',
      features: JSON.stringify(['Electric Start', 'Dual Channel ABS', 'LED Tail Light', 'Tripper Navigation', 'USB Charging']),
      images: JSON.stringify(['/images/vehicles/royal-enfield-classic.jpg']),
      location: 'Sector 17, Chandigarh',
      latitude: 30.7333,
      longitude: 76.7794,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    {
      name: 'Ather 450X - Electric Scooter',
      description: 'Premium electric scooter with smart features and zero emissions',
      type: VehicleType.BIKE,
      category: VehicleCategory.ELECTRIC_BIKE,
      capacity: 2,
      doors: 0,
      transmission: 'automatic',
      fuelType: 'electric',
      hourlyRate: 120.0,
      dailyRate: 900.0,
      weeklyRate: 5500.0,
      make: 'Ather',
      model: '450X',
      year: 2023,
      color: 'Space Grey',
      licensePlate: 'TN-07-KL-2468',
      features: JSON.stringify(['Touchscreen Dashboard', 'Google Maps', 'OTA Updates', 'Reverse Mode', 'Fast Charging']),
      images: JSON.stringify(['/images/vehicles/ather-450x.jpg']),
      location: 'Anna Nagar, Chennai',
      latitude: 13.0850,
      longitude: 80.2101,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
  ]

  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: { licensePlate: vehicle.licensePlate },
      update: {},
      create: vehicle,
    })
  }

  // Create vehicle-amenity mappings
  const createdVehicles = await prisma.vehicle.findMany()
  const createdAmenities = await prisma.vehicleAmenity.findMany()

  // Map amenities to vehicles based on features
  for (const vehicle of createdVehicles) {
    const features = JSON.parse(vehicle.features || '[]')
    
    for (const featureName of features) {
      const amenity = createdAmenities.find(a => 
        a.name.toLowerCase().includes(featureName.toLowerCase()) ||
        featureName.toLowerCase().includes(a.name.toLowerCase())
      )
      
      if (amenity) {
        await prisma.vehicleAmenityMapping.upsert({
          where: {
            vehicleId_amenityId: {
              vehicleId: vehicle.id,
              amenityId: amenity.id
            }
          },
          update: {},
          create: {
            vehicleId: vehicle.id,
            amenityId: amenity.id
          }
        })
      }
    }
  }

  console.log('✅ Database seeding completed!')
  console.log(`👤 Admin user: admin@triptogether.com / admin123`)
  console.log(`👤 Test user: test@triptogether.com / test123`)
  console.log(`🚗 Created ${vehicles.length} vehicles`)
  console.log(`🎯 Created ${amenities.length} amenities`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
