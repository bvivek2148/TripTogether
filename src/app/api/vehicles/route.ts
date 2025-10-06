import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { VehicleType, VehicleCategory, VehicleStatus } from "@prisma/client"

// Vehicle search schema
const searchSchema = z.object({
  type: z.nativeEnum(VehicleType).optional(),
  category: z.nativeEnum(VehicleCategory).optional(),
  location: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  capacity: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
  sortBy: z.enum(['price', 'rating', 'capacity', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Vehicle creation schema
const createVehicleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.nativeEnum(VehicleType),
  category: z.nativeEnum(VehicleCategory),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  doors: z.number().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  hourlyRate: z.number().min(0, "Hourly rate must be positive"),
  dailyRate: z.number().min(0, "Daily rate must be positive"),
  weeklyRate: z.number().optional(),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900, "Invalid year"),
  color: z.string().optional(),
  licensePlate: z.string().min(1, "License plate is required"),
  features: z.string().optional(), // JSON string
  images: z.string().optional(), // JSON string
  location: z.string().min(1, "Location is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    // Convert string numbers to numbers
    if (params.minPrice) params.minPrice = parseFloat(params.minPrice)
    if (params.maxPrice) params.maxPrice = parseFloat(params.maxPrice)
    if (params.capacity) params.capacity = parseInt(params.capacity)
    if (params.page) params.page = parseInt(params.page)
    if (params.limit) params.limit = parseInt(params.limit)

    const validatedParams = searchSchema.parse(params)
    
    // Build where clause
    const where: any = {
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    }

    if (validatedParams.type) {
      where.type = validatedParams.type
    }

    if (validatedParams.category) {
      where.category = validatedParams.category
    }

    if (validatedParams.location) {
      where.location = {
        contains: validatedParams.location,
        mode: 'insensitive'
      }
    }

    if (validatedParams.capacity) {
      where.capacity = {
        gte: validatedParams.capacity
      }
    }

    if (validatedParams.minPrice || validatedParams.maxPrice) {
      where.hourlyRate = {}
      if (validatedParams.minPrice) {
        where.hourlyRate.gte = validatedParams.minPrice
      }
      if (validatedParams.maxPrice) {
        where.hourlyRate.lte = validatedParams.maxPrice
      }
    }

    // Build order by clause
    const orderBy: any = {}
    if (validatedParams.sortBy === 'price') {
      orderBy.hourlyRate = validatedParams.sortOrder
    } else {
      orderBy[validatedParams.sortBy] = validatedParams.sortOrder
    }

    // Calculate pagination
    const skip = (validatedParams.page - 1) * validatedParams.limit

    // Get vehicles with amenities
    const [vehicles, totalCount] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy,
        skip,
        take: validatedParams.limit,
        include: {
          amenities: {
            include: {
              amenity: true
            }
          },
          reviews: {
            select: {
              overallRating: true
            }
          },
          _count: {
            select: {
              reviews: true,
              bookings: true
            }
          }
        }
      }),
      prisma.vehicle.count({ where })
    ])

    // Calculate average ratings
    const vehiclesWithRatings = vehicles.map(vehicle => {
      const avgRating = vehicle.reviews.length > 0
        ? vehicle.reviews.reduce((sum, review) => sum + review.overallRating, 0) / vehicle.reviews.length
        : 0

      return {
        ...vehicle,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: vehicle._count.reviews,
        bookingCount: vehicle._count.bookings,
        features: vehicle.features ? JSON.parse(vehicle.features) : [],
        images: vehicle.images ? JSON.parse(vehicle.images) : [],
      }
    })

    const totalPages = Math.ceil(totalCount / validatedParams.limit)

    return NextResponse.json({
      vehicles: vehiclesWithRatings,
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

    console.error("Vehicle search error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createVehicleSchema.parse(body)

    // Check if license plate already exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { licensePlate: validatedData.licensePlate }
    })

    if (existingVehicle) {
      return NextResponse.json(
        { error: "Vehicle with this license plate already exists" },
        { status: 400 }
      )
    }

    const vehicle = await prisma.vehicle.create({
      data: validatedData,
      include: {
        amenities: {
          include: {
            amenity: true
          }
        }
      }
    })

    return NextResponse.json(
      { message: "Vehicle created successfully", vehicle },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Vehicle creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
