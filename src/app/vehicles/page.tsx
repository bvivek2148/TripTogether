"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { Navigation } from "@/components/ui/navigation"
import { formatCurrency } from "@/lib/utils"

interface Vehicle {
  id: string
  name: string
  type: 'CAB' | 'BUS' | 'BIKE'
  category: string
  description: string
  capacity: number
  location: string
  hourlyRate: number
  dailyRate: number
  images: string[]
  averageRating: number
  reviewCount: number
}

interface VehicleResponse {
  vehicles: Vehicle[]
  pagination: {
    page: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<VehicleResponse['pagination'] | null>(null)
  const [sortBy, setSortBy] = useState('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    capacity: '',
  })

  const router = useRouter()

  // Toggle favorite functionality
  const toggleFavorite = (vehicleId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(vehicleId)) {
        newFavorites.delete(vehicleId)
      } else {
        newFavorites.add(vehicleId)
      }
      return newFavorites
    })
  }

  const fetchVehicles = async (page = 1) => {
    setCurrentPage(page)
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '12')

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })

      if (searchQuery) {
        params.set('search', searchQuery)
      }

      if (sortBy) {
        params.set('sortBy', sortBy)
      }

      // Try to fetch from API, but use mock data if API is not available
      try {
        const response = await fetch(`/api/vehicles?${params.toString()}`)
        if (response.ok) {
          const data: VehicleResponse = await response.json()
          setVehicles(data.vehicles)
          setPagination(data.pagination)
          return
        }
      } catch (apiError) {
        console.log('API not available, using mock data')
      }

      // Mock data for testing - Expanded with more vehicles
      const mockVehicles: Vehicle[] = [
        // CABS & CARS
        {
          id: '1',
          name: 'Swift Dzire',
          type: 'CAB',
          category: 'STANDARD_CAB',
          description: 'Comfortable sedan perfect for city rides and outstation trips',
          capacity: 4,
          location: 'Mumbai',
          hourlyRate: 150,
          dailyRate: 2500,
          images: [],
          averageRating: 4.5,
          reviewCount: 128
        },
        {
          id: '2',
          name: 'Honda City',
          type: 'CAB',
          category: 'PREMIUM_CAB',
          description: 'Premium sedan with excellent comfort and safety features',
          capacity: 4,
          location: 'Delhi',
          hourlyRate: 200,
          dailyRate: 3200,
          images: [],
          averageRating: 4.7,
          reviewCount: 95
        },
        {
          id: '3',
          name: 'Maruti Ertiga',
          type: 'CAB',
          category: 'STANDARD_CAB',
          description: '7-seater MPV ideal for family trips and group travel',
          capacity: 7,
          location: 'Bangalore',
          hourlyRate: 180,
          dailyRate: 2800,
          images: [],
          averageRating: 4.4,
          reviewCount: 87
        },
        {
          id: '4',
          name: 'Toyota Innova Crysta',
          type: 'CAB',
          category: 'PREMIUM_CAB',
          description: 'Spacious and comfortable premium MPV for long journeys',
          capacity: 7,
          location: 'Chennai',
          hourlyRate: 250,
          dailyRate: 4000,
          images: [],
          averageRating: 4.8,
          reviewCount: 156
        },
        {
          id: '5',
          name: 'Hyundai Verna',
          type: 'CAB',
          category: 'PREMIUM_CAB',
          description: 'Stylish sedan with modern features and comfortable interiors',
          capacity: 4,
          location: 'Pune',
          hourlyRate: 190,
          dailyRate: 3000,
          images: [],
          averageRating: 4.6,
          reviewCount: 73
        },
        {
          id: '6',
          name: 'Tata Nexon',
          type: 'CAB',
          category: 'STANDARD_CAB',
          description: 'Compact SUV perfect for city drives and weekend getaways',
          capacity: 5,
          location: 'Mumbai',
          hourlyRate: 170,
          dailyRate: 2700,
          images: [],
          averageRating: 4.3,
          reviewCount: 92
        },
        {
          id: '7',
          name: 'Mercedes E-Class',
          type: 'CAB',
          category: 'LUXURY_CAB',
          description: 'Luxury sedan for premium travel experience',
          capacity: 4,
          location: 'Delhi',
          hourlyRate: 500,
          dailyRate: 8000,
          images: [],
          averageRating: 4.9,
          reviewCount: 45
        },
        {
          id: '8',
          name: 'BMW 3 Series',
          type: 'CAB',
          category: 'LUXURY_CAB',
          description: 'Premium luxury car with exceptional comfort and performance',
          capacity: 4,
          location: 'Bangalore',
          hourlyRate: 600,
          dailyRate: 9500,
          images: [],
          averageRating: 4.8,
          reviewCount: 32
        },
        {
          id: '9',
          name: 'Wagon R',
          type: 'CAB',
          category: 'ECONOMY_CAB',
          description: 'Budget-friendly hatchback for short city trips',
          capacity: 4,
          location: 'Chennai',
          hourlyRate: 120,
          dailyRate: 2000,
          images: [],
          averageRating: 4.2,
          reviewCount: 164
        },
        {
          id: '10',
          name: 'Alto 800',
          type: 'CAB',
          category: 'ECONOMY_CAB',
          description: 'Most economical option for budget-conscious travelers',
          capacity: 4,
          location: 'Pune',
          hourlyRate: 100,
          dailyRate: 1800,
          images: [],
          averageRating: 4.0,
          reviewCount: 203
        },

        // BUSES
        {
          id: '11',
          name: 'Tempo Traveller',
          type: 'BUS',
          category: 'MINI_BUS',
          description: 'Perfect for group travel with comfortable seating',
          capacity: 12,
          location: 'Mumbai',
          hourlyRate: 400,
          dailyRate: 6000,
          images: [],
          averageRating: 4.3,
          reviewCount: 67
        },
        {
          id: '12',
          name: 'Force Traveller',
          type: 'BUS',
          category: 'MINI_BUS',
          description: 'Reliable mini bus for small group outings',
          capacity: 13,
          location: 'Delhi',
          hourlyRate: 420,
          dailyRate: 6300,
          images: [],
          averageRating: 4.2,
          reviewCount: 54
        },
        {
          id: '13',
          name: 'Tata Winger',
          type: 'BUS',
          category: 'MINI_BUS',
          description: 'Spacious mini bus with AC for comfortable group travel',
          capacity: 15,
          location: 'Bangalore',
          hourlyRate: 450,
          dailyRate: 6800,
          images: [],
          averageRating: 4.4,
          reviewCount: 78
        },
        {
          id: '14',
          name: 'Ashok Leyland Bus',
          type: 'BUS',
          category: 'STANDARD_BUS',
          description: 'Standard bus for medium-sized groups with basic amenities',
          capacity: 25,
          location: 'Chennai',
          hourlyRate: 600,
          dailyRate: 9000,
          images: [],
          averageRating: 4.1,
          reviewCount: 43
        },
        {
          id: '15',
          name: 'Volvo Bus',
          type: 'BUS',
          category: 'LARGE_BUS',
          description: 'Luxury bus for large group travel with AC and comfortable seats',
          capacity: 45,
          location: 'Mumbai',
          hourlyRate: 800,
          dailyRate: 12000,
          images: [],
          averageRating: 4.8,
          reviewCount: 34
        },
        {
          id: '16',
          name: 'Mercedes Luxury Coach',
          type: 'BUS',
          category: 'LARGE_BUS',
          description: 'Premium luxury coach with reclining seats and entertainment system',
          capacity: 40,
          location: 'Delhi',
          hourlyRate: 1200,
          dailyRate: 18000,
          images: [],
          averageRating: 4.9,
          reviewCount: 28
        },

        // BIKES & SCOOTERS
        {
          id: '17',
          name: 'Royal Enfield Classic',
          type: 'BIKE',
          category: 'CRUISER_BIKE',
          description: 'Classic motorcycle for adventure enthusiasts',
          capacity: 2,
          location: 'Chennai',
          hourlyRate: 80,
          dailyRate: 1200,
          images: [],
          averageRating: 4.6,
          reviewCount: 43
        },
        {
          id: '18',
          name: 'Honda Activa',
          type: 'BIKE',
          category: 'SCOOTER',
          description: 'Reliable scooter for daily commuting',
          capacity: 2,
          location: 'Pune',
          hourlyRate: 50,
          dailyRate: 800,
          images: [],
          averageRating: 4.4,
          reviewCount: 156
        },
        {
          id: '19',
          name: 'Yamaha FZ',
          type: 'BIKE',
          category: 'STANDARD_BIKE',
          description: 'Sporty bike perfect for city rides and short trips',
          capacity: 2,
          location: 'Mumbai',
          hourlyRate: 70,
          dailyRate: 1100,
          images: [],
          averageRating: 4.5,
          reviewCount: 89
        },
        {
          id: '20',
          name: 'KTM Duke 390',
          type: 'BIKE',
          category: 'SPORTS_BIKE',
          description: 'High-performance sports bike for thrill seekers',
          capacity: 2,
          location: 'Bangalore',
          hourlyRate: 120,
          dailyRate: 1800,
          images: [],
          averageRating: 4.7,
          reviewCount: 67
        },
        {
          id: '21',
          name: 'TVS Jupiter',
          type: 'BIKE',
          category: 'SCOOTER',
          description: 'Comfortable scooter with good mileage for city travel',
          capacity: 2,
          location: 'Delhi',
          hourlyRate: 45,
          dailyRate: 750,
          images: [],
          averageRating: 4.3,
          reviewCount: 134
        },
        {
          id: '22',
          name: 'Harley Davidson Street',
          type: 'BIKE',
          category: 'CRUISER_BIKE',
          description: 'Premium cruiser bike for luxury touring experience',
          capacity: 2,
          location: 'Mumbai',
          hourlyRate: 300,
          dailyRate: 4500,
          images: [],
          averageRating: 4.8,
          reviewCount: 23
        },
        {
          id: '23',
          name: 'Bajaj Pulsar',
          type: 'BIKE',
          category: 'STANDARD_BIKE',
          description: 'Popular bike with good performance and fuel efficiency',
          capacity: 2,
          location: 'Chennai',
          hourlyRate: 65,
          dailyRate: 1000,
          images: [],
          averageRating: 4.4,
          reviewCount: 112
        },
        {
          id: '24',
          name: 'Ather 450X',
          type: 'BIKE',
          category: 'ELECTRIC_BIKE',
          description: 'Electric scooter with smart features and zero emissions',
          capacity: 2,
          location: 'Bangalore',
          hourlyRate: 60,
          dailyRate: 950,
          images: [],
          averageRating: 4.6,
          reviewCount: 78
        },
        {
          id: '25',
          name: 'Mahindra XUV700',
          type: 'CAB',
          category: 'PREMIUM_CAB',
          description: 'Premium SUV with advanced features and spacious interiors',
          capacity: 7,
          location: 'Hyderabad',
          hourlyRate: 280,
          dailyRate: 4200,
          images: [],
          averageRating: 4.7,
          reviewCount: 65
        },
        {
          id: '26',
          name: 'Tata Safari',
          type: 'CAB',
          category: 'PREMIUM_CAB',
          description: 'Robust SUV perfect for family adventures and long drives',
          capacity: 7,
          location: 'Kolkata',
          hourlyRate: 260,
          dailyRate: 3900,
          images: [],
          averageRating: 4.5,
          reviewCount: 89
        },
        {
          id: '27',
          name: 'Honda Amaze',
          type: 'CAB',
          category: 'STANDARD_CAB',
          description: 'Compact sedan with good fuel efficiency and comfort',
          capacity: 4,
          location: 'Ahmedabad',
          hourlyRate: 140,
          dailyRate: 2300,
          images: [],
          averageRating: 4.3,
          reviewCount: 97
        },
        {
          id: '28',
          name: 'Kawasaki Ninja',
          type: 'BIKE',
          category: 'SPORTS_BIKE',
          description: 'High-performance sports bike for racing enthusiasts',
          capacity: 2,
          location: 'Hyderabad',
          hourlyRate: 200,
          dailyRate: 3000,
          images: [],
          averageRating: 4.8,
          reviewCount: 34
        },
        {
          id: '29',
          name: 'Suzuki Access',
          type: 'BIKE',
          category: 'SCOOTER',
          description: 'Lightweight scooter with excellent fuel economy',
          capacity: 2,
          location: 'Kolkata',
          hourlyRate: 40,
          dailyRate: 700,
          images: [],
          averageRating: 4.2,
          reviewCount: 145
        },
        {
          id: '30',
          name: 'BharatBenz Bus',
          type: 'BUS',
          category: 'STANDARD_BUS',
          description: 'Reliable bus for medium to large group transportation',
          capacity: 35,
          location: 'Ahmedabad',
          hourlyRate: 700,
          dailyRate: 10500,
          images: [],
          averageRating: 4.4,
          reviewCount: 52
        }
      ]

      // Apply filters to mock data
      let filteredVehicles = mockVehicles

      if (filters.type) {
        filteredVehicles = filteredVehicles.filter(v => v.type === filters.type)
      }
      if (filters.category) {
        filteredVehicles = filteredVehicles.filter(v => v.category === filters.category)
      }
      if (filters.location) {
        filteredVehicles = filteredVehicles.filter(v =>
          v.location.toLowerCase().includes(filters.location.toLowerCase())
        )
      }
      if (filters.capacity) {
        const [min, max] = filters.capacity.includes('-')
          ? filters.capacity.split('-').map(Number)
          : filters.capacity === '30+'
            ? [30, Infinity]
            : [0, Infinity]

        if (min !== undefined && max !== undefined) {
          filteredVehicles = filteredVehicles.filter(v =>
            v.capacity >= min && (max === Infinity || v.capacity <= max)
          )
        }
      }
      if (searchQuery) {
        filteredVehicles = filteredVehicles.filter(v =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      // Apply sorting
      if (sortBy === 'price') {
        filteredVehicles.sort((a, b) => a.hourlyRate - b.hourlyRate)
      } else if (sortBy === 'rating') {
        filteredVehicles.sort((a, b) => b.averageRating - a.averageRating)
      } else if (sortBy === 'capacity') {
        filteredVehicles.sort((a, b) => a.capacity - b.capacity)
      } else {
        filteredVehicles.sort((a, b) => a.name.localeCompare(b.name))
      }

      // Implement pagination for better UX with more vehicles
      const itemsPerPage = 12
      const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex)

      setVehicles(paginatedVehicles)
      setPagination({
        page: page,
        totalPages: totalPages,
        totalCount: filteredVehicles.length,
        hasNext: page < totalPages,
        hasPrev: page > 1
      })

    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [filters, searchQuery, sortBy])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      capacity: '',
    })
    setSearchQuery('')
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

  // Remove this condition to always show the page layout

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - Non-sticky */}
      <Navigation
        showBackButton={true}
        backUrl="/"
        backLabel="Back to Home"
        title="Browse Vehicles"
        subtitle="Find the perfect vehicle for your journey"
        className="!static !top-auto"
      />

      {/* Header Section - Matching Homepage Style */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden py-20">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Hero badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold mb-8 animate-fade-in-up shadow-lg backdrop-blur-sm border border-white/20">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              🚗 Browse Vehicles
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight animate-fade-in-up animation-delay-200">
              Find Your Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"> Vehicle</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400 font-light">
              Choose from our wide selection of <span className="font-semibold text-blue-600">premium cars</span>,
              <span className="font-semibold text-green-600"> comfortable buses</span>, and
              <span className="font-semibold text-orange-600"> reliable bikes</span> for your next journey
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">30+</div>
              <div className="text-gray-600 font-medium">Vehicles Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">8</div>
              <div className="text-gray-600 font-medium">Cities Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Support Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-gray-600 font-medium">Insured Vehicles</div>
            </div>
          </div>
        </div>
      </div>

      {/* About TripTogether Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About TripTogether
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Your trusted transportation partner, connecting India through safe, reliable, and affordable travel solutions.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Filters Section - Top Layout */}
        <div className="bg-gray-100 rounded-2xl shadow-lg border border-gray-400 p-8 mb-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black mb-1" style={{color: '#1a1a1a', fontWeight: '900', textShadow: '0 1px 3px rgba(0,0,0,0.2)'}}>Filter Vehicles</h2>
              <p className="text-base font-semibold" style={{color: '#2d2d2d', textShadow: '0 1px 2px rgba(0,0,0,0.1)'}}>Find your perfect ride with our advanced filters</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 font-medium px-4 py-2 rounded-xl transition-all duration-200 border-gray-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Vehicle Type */}
            <div>
              <label className="block text-xl font-black mb-4 uppercase tracking-wider" style={{color: '#1a1a1a', fontWeight: '900', letterSpacing: '0.1em', textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>
                VEHICLE TYPE
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: '', label: 'All Types', icon: '🔍' },
                  { value: 'CAB', label: 'Cars & Cabs', icon: '🚕' },
                  { value: 'BUS', label: 'Buses', icon: '🚌' },
                  { value: 'BIKE', label: 'Bikes & Scooters', icon: '🏍️' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleFilterChange('type', type.value)}
                    className={`p-4 text-center rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                      filters.type === type.value
                        ? type.value === 'CAB'
                          ? 'border-blue-300 bg-blue-50 text-blue-800 shadow-sm shadow-blue-100'
                          : type.value === 'BUS'
                          ? 'border-gray-300 bg-gray-50 text-gray-800 shadow-sm shadow-gray-100'
                          : type.value === 'BIKE'
                          ? 'border-slate-300 bg-slate-50 text-slate-800 shadow-sm shadow-slate-100'
                          : 'border-blue-300 bg-blue-50 text-blue-800 shadow-sm shadow-blue-100'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-sm font-semibold text-gray-900">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xl font-black mb-4 uppercase tracking-wider" style={{color: '#1a1a1a', fontWeight: '900', letterSpacing: '0.1em', textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>
                CATEGORY
              </label>
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-400"
                >
                  <option value="">🎯 All Categories</option>
                  <option value="ECONOMY_CAB">💰 Economy Cab</option>
                  <option value="STANDARD_CAB">🚗 Standard Cab</option>
                  <option value="PREMIUM_CAB">⭐ Premium Cab</option>
                  <option value="LUXURY_CAB">💎 Luxury Cab</option>
                  <option value="MINI_BUS">🚐 Mini Bus</option>
                  <option value="STANDARD_BUS">🚌 Standard Bus</option>
                  <option value="LARGE_BUS">🚍 Large Bus</option>
                  <option value="SCOOTER">🛵 Scooter</option>
                  <option value="STANDARD_BIKE">🏍️ Standard Bike</option>
                  <option value="SPORTS_BIKE">🏁 Sports Bike</option>
                  <option value="CRUISER_BIKE">🛣️ Cruiser Bike</option>
                  <option value="ELECTRIC_BIKE">⚡ Electric Bike</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xl font-black mb-4 uppercase tracking-wider" style={{color: '#1a1a1a', fontWeight: '900', letterSpacing: '0.1em', textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>
                LOCATION
              </label>
              <div className="relative mb-4">
                <Input
                  placeholder="🔍 Search by city or area..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 pl-12 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad'].map((city) => (
                  <button
                    key={city}
                    onClick={() => handleFilterChange('location', city)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 transform hover:scale-105 ${
                      filters.location === city
                        ? 'bg-blue-400 text-white shadow-sm shadow-blue-400/20'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:shadow-sm'
                    }`}
                  >
                    📍 {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-lg font-black mb-4 uppercase tracking-wider whitespace-nowrap" style={{color: '#1a1a1a', fontWeight: '900', letterSpacing: '0.05em', textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>
                PASSENGER CAPACITY
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '', label: 'Any', icon: '👥' },
                  { value: '1-4', label: '1-4 People', icon: '👤' },
                  { value: '5-8', label: '5-8 People', icon: '👥' },
                  { value: '9-15', label: '9-15 People', icon: '👨‍👩‍👧‍👦' },
                  { value: '16-30', label: '16-30 People', icon: '🚌' },
                  { value: '30+', label: '30+ People', icon: '🚍' }
                ].map((cap) => (
                  <button
                    key={cap.value}
                    onClick={() => handleFilterChange('capacity', cap.value)}
                    className={`p-3 text-xs text-center rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                      filters.capacity === cap.value
                        ? 'border-blue-300 bg-blue-50 text-blue-800 shadow-sm shadow-blue-100'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-lg mb-1">{cap.icon}</div>
                    <div className="font-semibold">{cap.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="relative">
              <Input
                placeholder="Search vehicles by name, model, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Vehicles</h3>
              <p className="text-gray-600">Finding the perfect rides for you...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div>
                <h2 className="text-3xl font-black mb-1" style={{color: '#1a1a1a', fontWeight: '900', textShadow: '0 1px 3px rgba(0,0,0,0.2)'}}>
                  Available Vehicles
                </h2>
                <p className="text-base font-semibold" style={{color: '#2d2d2d', textShadow: '0 1px 2px rgba(0,0,0,0.1)'}}>
                  {pagination?.totalCount || vehicles.length} vehicles found
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <span className="text-base font-bold" style={{color: '#1a1a1a', fontWeight: '700', textShadow: '0 1px 2px rgba(0,0,0,0.2)'}}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-400 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="capacity">Capacity</option>
                </select>
              </div>
            </div>

            {/* Vehicle Grid */}
            {vehicles.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl p-16 shadow-lg border border-gray-200 max-w-lg mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Vehicles Found</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    We couldn't find any vehicles matching your criteria. Try adjusting your filters or search terms to discover more options.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={clearFilters}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Clear All Filters
                    </Button>
                    <p className="text-sm text-gray-500">
                      Or try searching for specific vehicle names or locations
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 rounded-2xl overflow-hidden bg-white relative shadow-sm">
                    <div className="aspect-video bg-gradient-to-br from-gray-25 to-gray-50 relative overflow-hidden">
                      {vehicle.images.length > 0 ? (
                        <img
                          src={vehicle.images[0]}
                          alt={vehicle.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = getPlaceholderImage(vehicle.type, vehicle.category)
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-25 to-gray-50">
                          <div className="text-center">
                            <div className="text-6xl mb-2 text-gray-400">
                              {vehicle.type === 'CAB' ? '🚗' : vehicle.type === 'BUS' ? '🚌' : '🏍️'}
                            </div>
                            <p className="text-gray-700 text-sm font-semibold">{vehicle.name}</p>
                          </div>
                        </div>
                      )}

                      {/* Gradient overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                      {/* Type Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge
                          className={`${
                            vehicle.type === 'CAB' ? 'bg-blue-400 shadow-blue-400/20' :
                            vehicle.type === 'BUS' ? 'bg-gray-400 shadow-gray-400/20' :
                            'bg-slate-400 shadow-slate-400/20'
                          } text-white text-xs px-3 py-1.5 font-medium shadow-sm backdrop-blur-sm border border-white/20`}
                        >
                          {vehicle.type === 'CAB' ? '🚗 Car' : vehicle.type === 'BUS' ? '🚌 Bus' : '🏍️ Bike'}
                        </Badge>
                      </div>

                      {/* Availability Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-400 text-white text-xs px-3 py-1.5 font-medium shadow-sm shadow-green-400/20 backdrop-blur-sm border border-white/20">
                          ✅ Available
                        </Badge>
                      </div>

                      {/* Favorite indicator */}
                      {favorites.has(vehicle.id) && (
                        <div className="absolute bottom-4 right-4">
                          <div className="bg-red-500 text-white rounded-full p-2 shadow-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl font-bold text-gray-900 leading-tight">
                            {vehicle.name}
                          </h3>
                          {vehicle.reviewCount > 0 && (
                            <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                              <svg className="w-4 h-4 mr-1 fill-current text-amber-500" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="font-bold text-amber-700 text-sm">{vehicle.averageRating}</span>
                              <span className="text-amber-600 ml-1 text-xs font-medium">({vehicle.reviewCount})</span>
                            </div>
                          )}
                        </div>

                        <Badge
                          variant="outline"
                          className="text-sm font-medium border-gray-200 text-gray-700 bg-gray-50"
                        >
                          {getCategoryLabel(vehicle.category)}
                        </Badge>

                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 font-medium">
                          {vehicle.description}
                        </p>
                      </div>

                      {/* Vehicle Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="bg-gray-400 p-2 rounded-lg mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Capacity</div>
                            <div className="font-bold text-gray-900">{vehicle.capacity} {vehicle.capacity === 1 ? 'person' : 'people'}</div>
                          </div>
                        </div>
                        <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="bg-blue-400 p-2 rounded-lg mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Location</div>
                            <div className="font-bold text-blue-900">{vehicle.location}</div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Section */}
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <div className="flex items-baseline">
                              <span className="text-3xl font-bold text-gray-900">
                                {formatCurrency(vehicle.hourlyRate)}
                              </span>
                              <span className="text-sm font-semibold text-gray-700 ml-2">/hour</span>
                            </div>
                            <div className="text-sm text-gray-700 font-semibold">
                              {formatCurrency(vehicle.dailyRate)} per day
                            </div>
                          </div>
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                            BEST VALUE
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-gray-400 text-white px-3 py-1.5 rounded-full font-medium shadow-sm">
                            ⚡ Instant Booking
                          </span>
                          <span className="text-xs bg-green-400 text-white px-3 py-1.5 rounded-full font-medium shadow-sm">
                            🛡️ Insured
                          </span>
                          <span className="text-xs bg-blue-400 text-white px-3 py-1.5 rounded-full font-medium shadow-sm">
                            📞 24/7 Support
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-medium py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                          onClick={() => {
                            console.log('Navigating to vehicle:', vehicle.id)
                            router.push(`/vehicles/${vehicle.id}`)
                          }}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </Button>
                        <Button
                          className="flex-1 bg-blue-400 hover:bg-blue-500 text-white font-medium py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                          onClick={() => {
                            console.log('Quick booking for vehicle:', vehicle.id)
                            router.push(`/vehicles/${vehicle.id}/book`)
                          }}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h3z" />
                          </svg>
                          Book Now
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleFavorite(vehicle.id)}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-110 ${
                            favorites.has(vehicle.id)
                              ? 'border-red-500 bg-red-100 text-red-600 shadow-lg shadow-red-300'
                              : 'border-gray-400 hover:border-red-500 hover:bg-red-100 hover:text-red-600 hover:shadow-lg'
                          }`}
                        >
                          <svg
                            className="w-5 h-5 transition-all duration-200"
                            fill={favorites.has(vehicle.id) ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-16">
                <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
                  <Button
                    variant="outline"
                    disabled={!pagination.hasPrev}
                    onClick={() => fetchVehicles(currentPage - 1)}
                    className="disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl font-bold transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 text-black border-gray-400"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex gap-1 mx-2">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let page = i + 1;
                      if (pagination.totalPages > 5) {
                        const current = currentPage;
                        if (current <= 3) {
                          page = i + 1;
                        } else if (current >= pagination.totalPages - 2) {
                          page = pagination.totalPages - 4 + i;
                        } else {
                          page = current - 2 + i;
                        }
                      }
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          onClick={() => fetchVehicles(page)}
                          className={`w-10 h-10 rounded-xl font-bold transition-all duration-200 ${
                            page === currentPage
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 transform scale-110"
                              : "hover:bg-blue-50 hover:border-blue-300 hover:scale-105 text-black border-gray-400"
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    disabled={!pagination.hasNext}
                    onClick={() => fetchVehicles(currentPage + 1)}
                    className="disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl font-bold transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 text-black border-gray-400"
                  >
                    Next
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
