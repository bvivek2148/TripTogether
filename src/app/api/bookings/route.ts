import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { BookingStatus, PaymentStatus } from "@prisma/client"

// Booking creation schema
const createBookingSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  startDateTime: z.string().datetime("Invalid start date"),
  endDateTime: z.string().datetime("Invalid end date"),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().optional(),
  pickupLatitude: z.number().optional(),
  pickupLongitude: z.number().optional(),
  dropoffLatitude: z.number().optional(),
  dropoffLongitude: z.number().optional(),
  passengerCount: z.number().min(1, "At least 1 passenger required"),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
  selectedAmenities: z.array(z.object({
    amenityId: z.string(),
    quantity: z.number().min(1)
  })).optional(),
  routes: z.array(z.object({
    stopOrder: z.number(),
    location: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    estimatedTime: z.string().datetime().optional()
  })).optional()
})

// Booking search schema
const searchSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  vehicleId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
  sortBy: z.enum(['createdAt', 'startDateTime', 'totalCost']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    // Convert string numbers to numbers
    if (params.page) params.page = parseInt(params.page)
    if (params.limit) params.limit = parseInt(params.limit)

    const validatedParams = searchSchema.parse(params)
    
    // Build where clause
    const where: any = {
      userId: session.user.id
    }

    if (validatedParams.status) {
      where.status = validatedParams.status
    }

    if (validatedParams.vehicleId) {
      where.vehicleId = validatedParams.vehicleId
    }

    if (validatedParams.startDate || validatedParams.endDate) {
      where.startDateTime = {}
      if (validatedParams.startDate) {
        where.startDateTime.gte = new Date(validatedParams.startDate)
      }
      if (validatedParams.endDate) {
        where.startDateTime.lte = new Date(validatedParams.endDate)
      }
    }

    // Build order by clause
    const orderBy: any = {}
    orderBy[validatedParams.sortBy] = validatedParams.sortOrder

    // Calculate pagination
    const skip = (validatedParams.page - 1) * validatedParams.limit

    // Get bookings with related data
    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy,
        skip,
        take: validatedParams.limit,
        include: {
          vehicle: {
            select: {
              id: true,
              name: true,
              type: true,
              category: true,
              make: true,
              model: true,
              images: true,
              location: true
            }
          },
          routes: {
            orderBy: { stopOrder: 'asc' }
          },
          amenities: {
            include: {
              amenity: {
                select: {
                  id: true,
                  name: true,
                  category: true
                }
              }
            }
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.booking.count({ where })
    ])

    // Parse JSON fields and format data
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      vehicle: {
        ...booking.vehicle,
        images: booking.vehicle.images ? JSON.parse(booking.vehicle.images) : []
      }
    }))

    const totalPages = Math.ceil(totalCount / validatedParams.limit)

    return NextResponse.json({
      bookings: formattedBookings,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        totalCount,
        totalPages,
        hasNext: validatedParams.page < totalPages,
        hasPrev: validatedParams.page > 1
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Bookings fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)

    // Validate dates
    const startDate = new Date(validatedData.startDateTime)
    const endDate = new Date(validatedData.endDateTime)
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    if (startDate < new Date()) {
      return NextResponse.json(
        { error: "Start date cannot be in the past" },
        { status: 400 }
      )
    }

    // Check vehicle availability
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: validatedData.vehicleId },
      include: {
        amenities: {
          include: {
            amenity: true
          }
        }
      }
    })

    if (!vehicle || !vehicle.isActive) {
      return NextResponse.json(
        { error: "Vehicle not found or not available" },
        { status: 404 }
      )
    }

    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        vehicleId: validatedData.vehicleId,
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS']
        },
        OR: [
          {
            AND: [
              { startDateTime: { lte: startDate } },
              { endDateTime: { gt: startDate } }
            ]
          },
          {
            AND: [
              { startDateTime: { lt: endDate } },
              { endDateTime: { gte: endDate } }
            ]
          },
          {
            AND: [
              { startDateTime: { gte: startDate } },
              { endDateTime: { lte: endDate } }
            ]
          }
        ]
      }
    })

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: "Vehicle is not available for the selected time period" },
        { status: 400 }
      )
    }

    // Calculate pricing
    const durationHours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))
    const durationDays = Math.ceil(durationHours / 24)
    
    let basePrice = 0
    if (durationDays >= 7) {
      basePrice = (vehicle.weeklyRate || vehicle.dailyRate * 7) * Math.ceil(durationDays / 7)
    } else if (durationDays >= 1) {
      basePrice = vehicle.dailyRate * durationDays
    } else {
      basePrice = vehicle.hourlyRate * durationHours
    }

    // Calculate amenity pricing
    let amenityPrice = 0
    const selectedAmenityIds = validatedData.selectedAmenities?.map(a => a.amenityId) || []
    
    if (selectedAmenityIds.length > 0) {
      const amenities = await prisma.vehicleAmenity.findMany({
        where: { id: { in: selectedAmenityIds } }
      })
      
      amenityPrice = amenities.reduce((total, amenity) => {
        const selectedAmenity = validatedData.selectedAmenities?.find(a => a.amenityId === amenity.id)
        const quantity = selectedAmenity?.quantity || 1
        return total + (basePrice * (amenity.priceModifier / 100) * quantity)
      }, 0)
    }

    const taxAmount = (basePrice + amenityPrice) * 0.1 // 10% tax
    const totalCost = basePrice + amenityPrice + taxAmount

    // Generate booking reference
    const bookingReference = `TT${Date.now().toString().slice(-8)}`

    // Create booking in transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          bookingReference,
          userId: session.user.id,
          vehicleId: validatedData.vehicleId,
          startDateTime: startDate,
          endDateTime: endDate,
          pickupLocation: validatedData.pickupLocation,
          dropoffLocation: validatedData.dropoffLocation,
          pickupLatitude: validatedData.pickupLatitude,
          pickupLongitude: validatedData.pickupLongitude,
          dropoffLatitude: validatedData.dropoffLatitude,
          dropoffLongitude: validatedData.dropoffLongitude,
          basePrice,
          amenityPrice,
          taxAmount,
          totalCost,
          passengerCount: validatedData.passengerCount,
          specialRequests: validatedData.specialRequests,
          notes: validatedData.notes,
          status: BookingStatus.PENDING_PAYMENT,
          paymentStatus: PaymentStatus.PENDING
        }
      })

      // Create routes if provided
      if (validatedData.routes && validatedData.routes.length > 0) {
        await tx.bookingRoute.createMany({
          data: validatedData.routes.map(route => ({
            bookingId: newBooking.id,
            stopOrder: route.stopOrder,
            location: route.location,
            latitude: route.latitude,
            longitude: route.longitude,
            estimatedTime: route.estimatedTime ? new Date(route.estimatedTime) : null
          }))
        })
      }

      // Create amenity bookings if provided
      if (validatedData.selectedAmenities && validatedData.selectedAmenities.length > 0) {
        const amenityBookings = validatedData.selectedAmenities.map(amenity => {
          const amenityData = vehicle.amenities.find(va => va.amenity.id === amenity.amenityId)
          const price = amenityData ? basePrice * (amenityData.amenity.priceModifier / 100) * amenity.quantity : 0
          
          return {
            bookingId: newBooking.id,
            amenityId: amenity.amenityId,
            quantity: amenity.quantity,
            price
          }
        })

        await tx.bookingAmenity.createMany({
          data: amenityBookings
        })
      }

      return newBooking
    })

    // Fetch complete booking data
    const completeBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true,
            make: true,
            model: true
          }
        },
        routes: {
          orderBy: { stopOrder: 'asc' }
        },
        amenities: {
          include: {
            amenity: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: "Booking created successfully", 
        booking: completeBooking 
      },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Booking creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
