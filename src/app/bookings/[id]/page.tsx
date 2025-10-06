"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
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
  basePrice: number
  amenityPrice: number
  taxAmount: number
  totalCost: number
  passengerCount: number
  specialRequests?: string
  notes?: string
  status: string
  paymentStatus: string
  cancellationReason?: string
  cancellationDate?: string
  refundAmount?: number
  createdAt: string
  vehicle: {
    id: string
    name: string
    description: string
    type: string
    category: string
    capacity: number
    make: string
    model: string
    year: number
    color: string
    location: string
    images: string[]
    features: string[]
  }
  routes: Array<{
    id: string
    stopOrder: number
    location: string
    estimatedTime?: string
    actualTime?: string
  }>
  amenities: Array<{
    quantity: number
    price: number
    amenity: {
      id: string
      name: string
      category: string
      description: string
    }
  }>
  payments: Array<{
    id: string
    amount: number
    status: string
    paymentMethod: string
    createdAt: string
    paidAt?: string
  }>
}

export default function BookingDetailPage() {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const bookingId = params.id as string

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && bookingId) {
      fetchBooking()
    }
  }, [bookingId, status, router])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        setBooking(data.booking)
      } else if (response.status === 404) {
        router.push('/bookings')
      } else if (response.status === 403) {
        router.push('/bookings')
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
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

  const groupAmenitiesByCategory = () => {
    if (!booking) return {}
    
    return booking.amenities.reduce((acc, item) => {
      const category = item.amenity.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    }, {} as Record<string, any[]>)
  }

  if (status === "loading" || loading) {
    return <Loading />
  }

  if (!session) {
    return null
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/bookings')}>
            Back to Bookings
          </Button>
        </div>
      </div>
    )
  }

  const groupedAmenities = groupAmenitiesByCategory()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Booking {booking.bookingReference}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getStatusColor(booking.status) as any}>
                  {getStatusLabel(booking.status)}
                </Badge>
                {booking.paymentStatus === 'PENDING' && (
                  <Badge variant="warning">
                    Payment Pending
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {booking.status === 'PENDING_PAYMENT' && (
                <Button onClick={() => router.push(`/bookings/${booking.id}/payment`)}>
                  Pay Now
                </Button>
              )}
              
              {['CONFIRMED', 'PENDING_PAYMENT'].includes(booking.status) && (
                <Button 
                  variant="destructive"
                  onClick={() => router.push(`/bookings/${booking.id}/cancel`)}
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Details */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Pickup</h4>
                    <div className="text-sm text-gray-600">
                      <div>📅 {formatDateTime(booking.startDateTime)}</div>
                      <div>📍 {booking.pickupLocation}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Drop-off</h4>
                    <div className="text-sm text-gray-600">
                      <div>📅 {formatDateTime(booking.endDateTime)}</div>
                      {booking.dropoffLocation && (
                        <div>🏁 {booking.dropoffLocation}</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Passengers</h4>
                    <div className="text-sm text-gray-600">
                      {booking.passengerCount} passenger{booking.passengerCount > 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Booking Date</h4>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(booking.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Routes */}
                {booking.routes.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Route Stops</h4>
                    <div className="space-y-2">
                      {booking.routes.map((route, index) => (
                        <div key={route.id} className="flex items-center gap-3 text-sm">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {route.stopOrder}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{route.location}</div>
                            {route.estimatedTime && (
                              <div className="text-gray-500">
                                Estimated: {formatDateTime(route.estimatedTime)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Special Requests</h4>
                    <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                  </div>
                )}

                {/* Notes */}
                {booking.notes && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Details */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {/* Vehicle Image */}
                  <div className="w-24 h-18 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
                  
                  {/* Vehicle Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{booking.vehicle.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">
                        {getVehicleTypeLabel(booking.vehicle.type)}
                      </Badge>
                      <Badge variant="outline">
                        {getCategoryLabel(booking.vehicle.category)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Make & Model:</span>
                        <div className="font-medium">{booking.vehicle.make} {booking.vehicle.model}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Year:</span>
                        <div className="font-medium">{booking.vehicle.year}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Capacity:</span>
                        <div className="font-medium">{booking.vehicle.capacity} passengers</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Color:</span>
                        <div className="font-medium">{booking.vehicle.color}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Features */}
                {booking.vehicle.features.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {booking.vehicle.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Amenities */}
            {Object.keys(groupedAmenities).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(groupedAmenities).map(([category, amenities]) => (
                      <div key={category}>
                        <h4 className="font-medium text-gray-900 mb-2 capitalize">
                          {category.toLowerCase().replace('_', ' ')}
                        </h4>
                        <div className="space-y-2">
                          {amenities.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <div className="font-medium">{item.amenity.name}</div>
                                {item.amenity.description && (
                                  <div className="text-sm text-gray-500">{item.amenity.description}</div>
                                )}
                                {item.quantity > 1 && (
                                  <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{formatCurrency(item.price)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancellation Info */}
            {booking.status === 'CANCELLED' && (
              <Card>
                <CardHeader>
                  <CardTitle>Cancellation Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Cancelled on:</span>
                      <span className="ml-2 font-medium">
                        {booking.cancellationDate ? formatDateTime(booking.cancellationDate) : 'N/A'}
                      </span>
                    </div>
                    {booking.cancellationReason && (
                      <div>
                        <span className="text-gray-600">Reason:</span>
                        <span className="ml-2">{booking.cancellationReason}</span>
                      </div>
                    )}
                    {booking.refundAmount !== undefined && (
                      <div>
                        <span className="text-gray-600">Refund Amount:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {formatCurrency(booking.refundAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span>{formatCurrency(booking.basePrice)}</span>
                  </div>
                  {booking.amenityPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amenities:</span>
                      <span>{formatCurrency(booking.amenityPrice)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>{formatCurrency(booking.taxAmount)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(booking.totalCost)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            {booking.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {booking.payments.map((payment) => (
                      <div key={payment.id} className="border-b pb-3 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{formatCurrency(payment.amount)}</div>
                            <div className="text-sm text-gray-600">
                              {payment.paymentMethod.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDateTime(payment.createdAt)}
                            </div>
                          </div>
                          <Badge 
                            variant={payment.status === 'COMPLETED' ? 'success' : 'secondary'}
                            className="text-xs"
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/vehicles/${booking.vehicle.id}`)}
                >
                  View Vehicle Details
                </Button>
                
                {booking.status === 'COMPLETED' && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/vehicles/${booking.vehicle.id}/review`)}
                  >
                    Write Review
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.print()}
                >
                  Print Booking
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
