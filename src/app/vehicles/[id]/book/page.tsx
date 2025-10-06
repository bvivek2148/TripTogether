"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/ui/loading"
import { BookingForm } from "@/components/booking/booking-form"
import { formatCurrency } from "@/lib/utils"

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
  amenities: Array<{
    amenity: {
      id: string
      name: string
      category: string
      description: string
      priceModifier: number
    }
  }>
}

export default function BookVehiclePage() {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const vehicleId = params.id as string

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && vehicleId) {
      fetchVehicle()
    }
  }, [vehicleId, status, router])

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

      // Mock data for booking page
      const mockVehicles = [
        {
          id: '1',
          name: 'Swift Dzire',
          description: 'Comfortable sedan perfect for city rides and outstation trips',
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
          amenities: []
        },
        {
          id: '2',
          name: 'Honda City',
          description: 'Premium sedan with excellent comfort and safety features',
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
          amenities: []
        }
      ]

      const foundVehicle = mockVehicles.find(v => v.id === vehicleId)
      if (foundVehicle) {
        setVehicle(foundVehicle)
      } else {
        router.push('/vehicles')
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingCreated = (booking: any) => {
    router.push(`/bookings/${booking.id}`)
  }

  const getVehicleTypeLabel = (type: string) => {
    return type === 'CAB' ? 'Cab' : 'Bus'
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
    }
    return labels[category] || category
  }

  if (status === "loading" || loading) {
    return <Loading />
  }

  if (!session) {
    return null
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">The vehicle you're trying to book doesn't exist.</p>
          <Button onClick={() => router.push('/vehicles')}>
            Back to Vehicles
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Professional badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-sm font-semibold mb-8 animate-fade-in-up shadow-lg backdrop-blur-sm border border-white/20">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            📅 Book Your Trip
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up animation-delay-200">
            Book
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600"> {vehicle.name}</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400 font-light mb-8">
            Complete your booking for this <span className="font-semibold text-blue-600">{getCategoryLabel(vehicle.category)}</span> and
            <span className="font-semibold text-green-600"> start your journey</span> with confidence.
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <BookingForm 
              vehicle={vehicle} 
              onBookingCreated={handleBookingCreated}
            />
          </div>

          {/* Vehicle Summary Sidebar */}
          <div className="space-y-6">
            {/* Vehicle Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Vehicle Image */}
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    {vehicle.images.length > 0 ? (
                      <img
                        src={vehicle.images[0]}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/vehicle-placeholder.jpg'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6h4v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Vehicle Details */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{vehicle.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{vehicle.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Make & Model:</span>
                        <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year:</span>
                        <span className="font-medium">{vehicle.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{vehicle.capacity} passengers</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transmission:</span>
                        <span className="font-medium capitalize">{vehicle.transmission}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fuel Type:</span>
                        <span className="font-medium capitalize">{vehicle.fuelType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{vehicle.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Pricing</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hourly Rate:</span>
                        <span className="font-medium">{formatCurrency(vehicle.hourlyRate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily Rate:</span>
                        <span className="font-medium">{formatCurrency(vehicle.dailyRate)}</span>
                      </div>
                      {vehicle.weeklyRate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weekly Rate:</span>
                          <span className="font-medium">{formatCurrency(vehicle.weeklyRate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  {vehicle.features.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {vehicle.features.slice(0, 6).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {vehicle.features.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{vehicle.features.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Policy Card */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Policy</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <div>
                  <strong>Cancellation Policy:</strong>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Free cancellation 72+ hours before trip</li>
                    <li>• 75% refund 48-72 hours before trip</li>
                    <li>• 50% refund 24-48 hours before trip</li>
                    <li>• No refund less than 24 hours before trip</li>
                  </ul>
                </div>
                
                <div>
                  <strong>Payment:</strong>
                  <p className="text-xs mt-1">
                    Payment is required to confirm your booking. We accept all major credit cards.
                  </p>
                </div>
                
                <div>
                  <strong>Driver:</strong>
                  <p className="text-xs mt-1">
                    Professional driver included with all bookings. Driver contact details will be provided 24 hours before your trip.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
