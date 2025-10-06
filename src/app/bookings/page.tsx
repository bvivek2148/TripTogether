"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/ui/loading"
import { formatCurrency, formatDateTime } from "@/lib/utils"

interface Booking {
  id: string
  bookingReference: string
  startDateTime: string
  endDateTime: string
  pickupLocation: string
  dropoffLocation?: string
  totalCost: number
  passengerCount: number
  status: string
  paymentStatus: string
  vehicle: {
    id: string
    name: string
    type: string
    category: string
    make: string
    model: string
    images: string[]
    location: string
  }
  amenities: Array<{
    quantity: number
    amenity: {
      name: string
      category: string
    }
  }>
}

interface BookingsResponse {
  bookings: Booking[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<BookingsResponse['pagination'] | null>(null)
  const [filter, setFilter] = useState('all')
  
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchBookings()
    }
  }, [status, filter, router])

  const fetchBookings = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '10')
      
      if (filter !== 'all') {
        params.set('status', filter.toUpperCase())
      }

      const response = await fetch(`/api/bookings?${params.toString()}`)
      if (response.ok) {
        const data: BookingsResponse = await response.json()
        setBookings(data.bookings)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'secondary',
      'PENDING_PAYMENT': 'warning',
      'CONFIRMED': 'success',
      'IN_PROGRESS': 'default',
      'COMPLETED': 'success',
      'CANCELLED': 'destructive',
      'REFUNDED': 'secondary'
    }
    return colors[status] || 'secondary'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'DRAFT': 'Draft',
      'PENDING_PAYMENT': 'Pending Payment',
      'CONFIRMED': 'Confirmed',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled',
      'REFUNDED': 'Refunded'
    }
    return labels[status] || status
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="mt-2 text-gray-600">Manage your transportation bookings</p>
            </div>
            <Button onClick={() => router.push('/vehicles')}>
              Book New Trip
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Bookings' },
                { key: 'pending_payment', label: 'Pending Payment' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'in_progress', label: 'In Progress' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "You haven't made any bookings yet." 
                : `No bookings with status "${getStatusLabel(filter.toUpperCase())}" found.`
              }
            </p>
            <Button onClick={() => router.push('/vehicles')}>
              Book Your First Trip
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.bookingReference}
                          </h3>
                          <Badge variant={getStatusColor(booking.status) as any}>
                            {getStatusLabel(booking.status)}
                          </Badge>
                          {booking.paymentStatus === 'PENDING' && (
                            <Badge variant="warning">
                              Payment Pending
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <div className="font-medium text-gray-900 mb-1">Vehicle</div>
                            <div>{booking.vehicle.name}</div>
                            <div className="text-xs">
                              {getCategoryLabel(booking.vehicle.category)} • {booking.vehicle.make} {booking.vehicle.model}
                            </div>
                          </div>
                          
                          <div>
                            <div className="font-medium text-gray-900 mb-1">Trip Details</div>
                            <div>📅 {formatDateTime(booking.startDateTime)}</div>
                            <div>📍 {booking.pickupLocation}</div>
                            {booking.dropoffLocation && (
                              <div>🏁 {booking.dropoffLocation}</div>
                            )}
                          </div>
                          
                          <div>
                            <div className="font-medium text-gray-900 mb-1">Passengers</div>
                            <div>{booking.passengerCount} passenger{booking.passengerCount > 1 ? 's' : ''}</div>
                          </div>
                          
                          <div>
                            <div className="font-medium text-gray-900 mb-1">Total Cost</div>
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(booking.totalCost)}
                            </div>
                          </div>
                        </div>

                        {/* Amenities */}
                        {booking.amenities.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium text-gray-900 mb-1">Amenities</div>
                            <div className="flex flex-wrap gap-1">
                              {booking.amenities.map((amenity, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {amenity.amenity.name} {amenity.quantity > 1 && `(${amenity.quantity})`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Vehicle Image */}
                      <div className="lg:w-32 lg:h-24">
                        <div className="aspect-video lg:aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
                          {booking.vehicle.images.length > 0 ? (
                            <img
                              src={booking.vehicle.images[0]}
                              alt={booking.vehicle.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/images/vehicle-placeholder.jpg'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6h4v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 lg:w-32">
                        <Button
                          size="sm"
                          onClick={() => router.push(`/bookings/${booking.id}`)}
                        >
                          View Details
                        </Button>
                        
                        {booking.status === 'PENDING_PAYMENT' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/bookings/${booking.id}/payment`)}
                          >
                            Pay Now
                          </Button>
                        )}
                        
                        {['CONFIRMED', 'PENDING_PAYMENT'].includes(booking.status) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => router.push(`/bookings/${booking.id}/cancel`)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!pagination.hasPrev}
                    onClick={() => fetchBookings(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === pagination.page ? "default" : "outline"}
                      onClick={() => fetchBookings(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    disabled={!pagination.hasNext}
                    onClick={() => fetchBookings(pagination.page + 1)}
                  >
                    Next
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
