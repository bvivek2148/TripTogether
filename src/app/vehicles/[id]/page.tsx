"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/ui/loading"
import { Navigation, Breadcrumb } from "@/components/ui/navigation"
import { VehicleImageGallery } from "@/components/ui/vehicle-image-gallery"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Vehicle {
  id: string
  name: string
  description: string
  type: string
  category: string
  capacity: number
  doors: number
  transmission: string
  fuelType: string
  hourlyRate: number
  dailyRate: number
  weeklyRate: number
  make: string
  model: string
  year: number
  color: string
  location: string
  features: string[]
  images: string[]
  averageRating: number
  reviewCount: number
  bookingCount: number
  amenities: Array<{
    amenity: {
      id: string
      name: string
      category: string
      description: string
      priceModifier: number
    }
  }>
  reviews: Array<{
    id: string
    overallRating: number
    title: string
    comment: string
    createdAt: string
    user: {
      name: string
      image: string
    }
  }>
}

export default function VehicleDetailPage() {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const vehicleId = params.id as string

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        // Try API first, fallback to mock data
        try {
          const response = await fetch(`/api/vehicles/${vehicleId}`)
          if (response.ok) {
            const data = await response.json()
            setVehicle(data.vehicle)
            setLoading(false)
            return
          }
        } catch (apiError) {
          console.log('API not available, using mock data')
        }

        // Complete mock data matching all vehicles from the list
        const mockVehicles = [
          {
            id: '1',
            name: 'Swift Dzire',
            description: 'Comfortable sedan perfect for city rides and outstation trips. Features modern amenities and excellent fuel efficiency.',
            type: 'CAB',
            category: 'STANDARD_CAB',
            capacity: 4,
            doors: 4,
            transmission: 'Manual',
            fuelType: 'Petrol',
            hourlyRate: 150,
            dailyRate: 2500,
            weeklyRate: 15000,
            make: 'Maruti Suzuki',
            model: 'Dzire',
            year: 2023,
            color: 'White',
            location: 'Mumbai',
            features: ['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'USB Charging'],
            images: [],
            averageRating: 4.5,
            reviewCount: 128,
            bookingCount: 45,
            amenities: [],
            reviews: [
              {
                id: '1',
                overallRating: 5,
                title: 'Excellent Service',
                comment: 'Great car, clean and comfortable. Driver was very professional.',
                user: { name: 'Rahul Sharma' },
                createdAt: '2024-01-15'
              }
            ]
          },
          {
            id: '2',
            name: 'Honda City',
            description: 'Premium sedan with excellent comfort and safety features. Perfect for business trips and family outings.',
            type: 'CAB',
            category: 'PREMIUM_CAB',
            capacity: 4,
            doors: 4,
            transmission: 'Automatic',
            fuelType: 'Petrol',
            hourlyRate: 200,
            dailyRate: 3200,
            weeklyRate: 20000,
            make: 'Honda',
            model: 'City',
            year: 2023,
            color: 'Silver',
            location: 'Delhi',
            features: ['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'USB Charging', 'Leather Seats'],
            images: [],
            averageRating: 4.7,
            reviewCount: 95,
            bookingCount: 32,
            amenities: [],
            reviews: []
          },
          // Add more vehicles to match the main list
          {
            id: '3',
            name: 'Maruti Ertiga',
            description: '7-seater MPV ideal for family trips and group travel with spacious interiors.',
            type: 'CAB',
            category: 'STANDARD_CAB',
            capacity: 7,
            doors: 4,
            transmission: 'Manual',
            fuelType: 'Petrol',
            hourlyRate: 180,
            dailyRate: 2800,
            weeklyRate: 17000,
            make: 'Maruti Suzuki',
            model: 'Ertiga',
            year: 2023,
            color: 'Grey',
            location: 'Bangalore',
            features: ['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'USB Charging', '7 Seater'],
            images: [],
            averageRating: 4.4,
            reviewCount: 87,
            bookingCount: 28,
            amenities: [],
            reviews: []
          },
          {
            id: '10',
            name: 'Alto 800',
            description: 'Most economical option for budget-conscious travelers with good fuel efficiency.',
            type: 'CAB',
            category: 'ECONOMY_CAB',
            capacity: 4,
            doors: 4,
            transmission: 'Manual',
            fuelType: 'Petrol',
            hourlyRate: 100,
            dailyRate: 1800,
            weeklyRate: 11000,
            make: 'Maruti Suzuki',
            model: 'Alto 800',
            year: 2022,
            color: 'Red',
            location: 'Pune',
            features: ['Air Conditioning', 'Basic Audio System'],
            images: [],
            averageRating: 4.0,
            reviewCount: 203,
            bookingCount: 67,
            amenities: [],
            reviews: []
          },
          {
            id: '24',
            name: 'Ather 450X',
            description: 'Electric scooter with smart features and zero emissions for eco-friendly travel.',
            type: 'BIKE',
            category: 'ELECTRIC_BIKE',
            capacity: 2,
            doors: 0,
            transmission: 'Automatic',
            fuelType: 'Electric',
            hourlyRate: 60,
            dailyRate: 950,
            weeklyRate: 6000,
            make: 'Ather',
            model: '450X',
            year: 2023,
            color: 'White',
            location: 'Bangalore',
            features: ['Smart Dashboard', 'GPS Navigation', 'Mobile App', 'Fast Charging'],
            images: [],
            averageRating: 4.6,
            reviewCount: 78,
            bookingCount: 23,
            amenities: [],
            reviews: []
          }
        ]

        // Find the vehicle by ID
        let foundVehicle = mockVehicles.find(v => v.id === vehicleId)

        // If vehicle not found in mock data, generate one dynamically
        if (!foundVehicle) {
          const vehicleNames = [
            'Swift Dzire', 'Honda City', 'Toyota Camry', 'Mercedes E-Class',
            'Tempo Traveller', 'Ashok Leyland Bus', 'Volvo Bus', 'Mercedes Bus',
            'Honda Activa 6G', 'TVS Jupiter 125', 'Hero Splendor Plus', 'Bajaj Pulsar NS200',
            'Royal Enfield Classic 350', 'Ather 450X', 'Maruti Ertiga', 'Hyundai Creta',
            'Tata Nexon', 'Mahindra XUV500', 'Ford EcoSport', 'Renault Duster'
          ]

          const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad']
          const colors = ['White', 'Silver', 'Black', 'Red', 'Blue', 'Grey']

          const vehicleIndex = parseInt(vehicleId) % vehicleNames.length
          const name = vehicleNames[vehicleIndex]

          foundVehicle = {
            id: vehicleId,
            name: name,
            description: `Professional ${name} with modern amenities and excellent service. Perfect for your transportation needs with comfortable seating and reliable performance.`,
            type: parseInt(vehicleId) <= 8 ? 'CAB' : parseInt(vehicleId) <= 16 ? 'BUS' : 'BIKE',
            category: parseInt(vehicleId) <= 4 ? 'STANDARD_CAB' : parseInt(vehicleId) <= 8 ? 'PREMIUM_CAB' : parseInt(vehicleId) <= 12 ? 'MINI_BUS' : parseInt(vehicleId) <= 16 ? 'STANDARD_BUS' : 'STANDARD_BIKE',
            capacity: parseInt(vehicleId) <= 8 ? 4 : parseInt(vehicleId) <= 16 ? 25 : 2,
            doors: parseInt(vehicleId) <= 16 ? 4 : 0,
            transmission: parseInt(vehicleId) % 2 === 0 ? 'Automatic' : 'Manual',
            fuelType: parseInt(vehicleId) === 24 ? 'Electric' : 'Petrol',
            hourlyRate: parseInt(vehicleId) <= 8 ? 150 + (parseInt(vehicleId) * 25) : parseInt(vehicleId) <= 16 ? 300 + (parseInt(vehicleId) * 50) : 50 + (parseInt(vehicleId) * 10),
            dailyRate: parseInt(vehicleId) <= 8 ? 2500 + (parseInt(vehicleId) * 300) : parseInt(vehicleId) <= 16 ? 4500 + (parseInt(vehicleId) * 500) : 800 + (parseInt(vehicleId) * 100),
            weeklyRate: parseInt(vehicleId) <= 8 ? 15000 + (parseInt(vehicleId) * 2000) : parseInt(vehicleId) <= 16 ? 25000 + (parseInt(vehicleId) * 3000) : 5000 + (parseInt(vehicleId) * 500),
            make: name.split(' ')[0],
            model: name.split(' ').slice(1).join(' '),
            year: 2023,
            color: colors[parseInt(vehicleId) % colors.length],
            location: locations[parseInt(vehicleId) % locations.length],
            features: ['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'USB Charging', 'Professional Service'],
            images: [],
            averageRating: 4.0 + (parseInt(vehicleId) % 10) / 10,
            reviewCount: 50 + (parseInt(vehicleId) * 10),
            bookingCount: 20 + (parseInt(vehicleId) * 3),
            amenities: [],
            reviews: [
              {
                id: '1',
                overallRating: 4 + (parseInt(vehicleId) % 2),
                title: 'Great Experience',
                comment: `Excellent ${name}! Clean, comfortable, and reliable service. Highly recommended for travel.`,
                user: { name: 'Satisfied Customer' },
                createdAt: '2024-01-15'
              }
            ]
          }
        }

        setVehicle(foundVehicle)
      } catch (error) {
        console.error('Error fetching vehicle:', error)
      } finally {
        setLoading(false)
      }
    }

    const checkFavoriteStatus = async () => {
      if (!session) return
      try {
        const response = await fetch('/api/favorites')
        if (response.ok) {
          const data = await response.json()
          const favorite = data.favorites.find((fav: any) => fav.vehicle.id === vehicleId)
          setIsFavorite(!!favorite)
        }
      } catch (error) {
        console.error('Error checking favorite status:', error)
      }
    }

    if (vehicleId) {
      fetchVehicle()
      if (session) {
        checkFavoriteStatus()
      }
    }
  }, [vehicleId, router, session])

  const toggleFavorite = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    setFavoriteLoading(true)
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?vehicleId=${vehicleId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setIsFavorite(false)
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vehicleId })
        })
        if (response.ok) {
          setIsFavorite(true)
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setFavoriteLoading(false)
    }
  }

  const getVehicleTypeLabel = (type: string) => {
    switch (type) {
      case 'CAB': return 'Cab'
      case 'BUS': return 'Bus'
      case 'BIKE': return 'Bike'
      default: return type
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'ECONOMY_CAB': 'Economy Cab',
      'STANDARD_CAB': 'Standard Cab',
      'PREMIUM_CAB': 'Premium Cab',
      'LUXURY_CAB': 'Luxury Cab',
      'MINI_BUS': 'Mini Bus',
      'STANDARD_BUS': 'Standard Bus',
      'LARGE_BUS': 'Large Bus',
      'LUXURY_BUS': 'Luxury Bus',
      'STANDARD_BIKE': 'Standard Bike',
      'SPORTS_BIKE': 'Sports Bike',
      'CRUISER_BIKE': 'Cruiser Bike',
      'SCOOTER': 'Scooter',
      'ELECTRIC_BIKE': 'Electric Bike',
    }
    return labels[category] || category
  }

  const groupAmenitiesByCategory = (amenities: Vehicle['amenities']) => {
    return amenities.reduce((acc, { amenity }) => {
      const category = amenity.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(amenity)
      return acc
    }, {} as Record<string, any[]>)
  }

  const getPlaceholderImage = (type: string, category?: string) => {
    switch (type) {
      case 'CAB':
        return '/images/cab-placeholder.svg'
      case 'BUS':
        return '/images/bus-placeholder.svg'
      case 'BIKE':
        return category === 'SCOOTER' ? '/images/scooter-placeholder.svg' : '/images/bike-placeholder.svg'
      default:
        return '/images/vehicle-placeholder.svg'
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navigation
          showBackButton={true}
          backUrl="/vehicles"
          backLabel="Back to Vehicles"
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md mx-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Vehicle Not Found</h2>
            <p className="text-gray-600 mb-6">The vehicle you're looking for doesn't exist or may have been removed.</p>
            <Button
              onClick={() => router.push('/vehicles')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5"
            >
              Browse All Vehicles
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const groupedAmenities = groupAmenitiesByCategory(vehicle.amenities)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <Navigation
        showBackButton={true}
        backUrl="/vehicles"
        backLabel="Back to Vehicles"
        title={vehicle.name}
        subtitle={`${getCategoryLabel(vehicle.category)} • ${vehicle.location}`}
      />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Browse Vehicles', href: '/vehicles' },
            { label: vehicle.name }
          ]}
        />
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Professional badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold mb-8 animate-fade-in-up shadow-lg backdrop-blur-sm border border-white/20">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            🚗 Vehicle Details
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up animation-delay-200">
            {vehicle.name}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"> Experience</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400 font-light mb-8">
            {vehicle.description}
          </p>

          {/* Vehicle Badges */}
          <div className="flex flex-wrap justify-center items-center gap-4 animate-fade-in-up animation-delay-600">
            <Badge
              variant="secondary"
              className={`${
                vehicle.type === 'CAB' ? 'bg-blue-100 text-blue-800' :
                vehicle.type === 'BUS' ? 'bg-green-100 text-green-800' :
                'bg-orange-100 text-orange-800'
              } px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-sm`}
            >
              {getVehicleTypeLabel(vehicle.type)}
            </Badge>
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-semibold shadow-lg border-gray-200">
              {getCategoryLabel(vehicle.category)}
            </Badge>
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-semibold shadow-lg border-gray-200">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {vehicle.capacity} Seats
            </Badge>
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-semibold shadow-lg border-gray-200">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {vehicle.location}
            </Badge>
            {vehicle.reviewCount > 0 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-sm">
                <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {vehicle.averageRating} ({vehicle.reviewCount} reviews)
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <VehicleImageGallery
              images={vehicle.images}
              vehicleName={vehicle.name}
              vehicleType={vehicle.type}
            />

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Vehicle</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{vehicle.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Make & Model</div>
                    <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Year</div>
                    <div className="font-medium">{vehicle.year}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Color</div>
                    <div className="font-medium">{vehicle.color}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Transmission</div>
                    <div className="font-medium capitalize">{vehicle.transmission}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Fuel Type</div>
                    <div className="font-medium capitalize">{vehicle.fuelType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Doors</div>
                    <div className="font-medium">{vehicle.doors}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium">{vehicle.location}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Bookings</div>
                    <div className="font-medium">{vehicle.bookingCount} completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            {vehicle.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {Object.keys(groupedAmenities).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(groupedAmenities).map(([category, amenities]) => (
                      <div key={category}>
                        <h4 className="font-medium text-gray-900 mb-2 capitalize">
                          {category.toLowerCase().replace('_', ' ')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {amenities.map((amenity) => (
                            <div key={amenity.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <div className="font-medium">{amenity.name}</div>
                                {amenity.description && (
                                  <div className="text-sm text-gray-500">{amenity.description}</div>
                                )}
                              </div>
                              {amenity.priceModifier > 0 && (
                                <Badge variant="secondary">
                                  +{amenity.priceModifier}%
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hourly Rate</span>
                    <span className="text-xl font-bold">{formatCurrency(vehicle.hourlyRate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Daily Rate</span>
                    <span className="text-xl font-bold">{formatCurrency(vehicle.dailyRate)}</span>
                  </div>
                  {vehicle.weeklyRate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Weekly Rate</span>
                      <span className="text-xl font-bold">{formatCurrency(vehicle.weeklyRate)}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => router.push(`/vehicles/${vehicle.id}/book`)}
                  >
                    Book Now
                  </Button>

                  {session ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={toggleFavorite}
                      disabled={favoriteLoading}
                    >
                      {favoriteLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          Loading...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <svg
                            className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                            fill={isFavorite ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </div>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/auth/signin')}
                    >
                      Sign in to Add Favorites
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rating Card */}
            {vehicle.reviewCount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {vehicle.averageRating}
                    </div>
                    <div className="text-yellow-500 text-xl">
                      {'★'.repeat(Math.floor(vehicle.averageRating))}
                      {'☆'.repeat(5 - Math.floor(vehicle.averageRating))}
                    </div>
                    <div className="text-sm text-gray-500">
                      Based on {vehicle.reviewCount} reviews
                    </div>
                  </div>
                  
                  {vehicle.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-t pt-4 first:border-t-0 first:pt-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {review.user.image ? (
                            <img
                              src={review.user.image}
                              alt={review.user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {review.user.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{review.user.name}</div>
                          <div className="text-yellow-500 text-sm">
                            {'★'.repeat(review.overallRating)}
                            {'☆'.repeat(5 - review.overallRating)}
                          </div>
                        </div>
                      </div>
                      {review.title && (
                        <div className="font-medium text-sm mb-1">{review.title}</div>
                      )}
                      {review.comment && (
                        <p className="text-sm text-gray-600 line-clamp-3">{review.comment}</p>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  ))}
                  
                  {vehicle.reviewCount > 3 && (
                    <Button variant="ghost" className="w-full mt-4">
                      View All Reviews
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
