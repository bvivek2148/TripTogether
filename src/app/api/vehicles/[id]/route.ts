import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { VehicleType, VehicleCategory, VehicleStatus } from "@prisma/client"

// Vehicle update schema
const updateVehicleSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  type: z.nativeEnum(VehicleType).optional(),
  category: z.nativeEnum(VehicleCategory).optional(),
  capacity: z.number().min(1, "Capacity must be at least 1").optional(),
  doors: z.number().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  hourlyRate: z.number().min(0, "Hourly rate must be positive").optional(),
  dailyRate: z.number().min(0, "Daily rate must be positive").optional(),
  weeklyRate: z.number().optional(),
  make: z.string().min(1, "Make is required").optional(),
  model: z.string().min(1, "Model is required").optional(),
  year: z.number().min(1900, "Invalid year").optional(),
  color: z.string().optional(),
  licensePlate: z.string().min(1, "License plate is required").optional(),
  features: z.string().optional(), // JSON string
  images: z.string().optional(), // JSON string
  location: z.string().min(1, "Location is required").optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        amenities: {
          include: {
            amenity: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'IN_PROGRESS']
            }
          },
          select: {
            startDateTime: true,
            endDateTime: true
          }
        },
        _count: {
          select: {
            reviews: true,
            bookings: true,
            favorites: true
          }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      )
    }

    // Calculate average rating
    const avgRating = vehicle.reviews.length > 0
      ? vehicle.reviews.reduce((sum, review) => sum + review.overallRating, 0) / vehicle.reviews.length
      : 0

    // Parse JSON fields
    const vehicleWithParsedData = {
      ...vehicle,
      features: vehicle.features ? JSON.parse(vehicle.features) : [],
      images: vehicle.images ? JSON.parse(vehicle.images) : [],
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: vehicle._count.reviews,
      bookingCount: vehicle._count.bookings,
      favoriteCount: vehicle._count.favorites,
      reviews: vehicle.reviews.map(review => ({
        ...review,
        images: review.images ? JSON.parse(review.images) : []
      }))
    }

    return NextResponse.json({ vehicle: vehicleWithParsedData })

  } catch (error) {
    console.error("Vehicle fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateVehicleSchema.parse(body)

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id }
    })

    if (!existingVehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      )
    }

    // Check if license plate is being changed and if it already exists
    if (validatedData.licensePlate && validatedData.licensePlate !== existingVehicle.licensePlate) {
      const plateExists = await prisma.vehicle.findUnique({
        where: { licensePlate: validatedData.licensePlate }
      })

      if (plateExists) {
        return NextResponse.json(
          { error: "Vehicle with this license plate already exists" },
          { status: 400 }
        )
      }
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: validatedData,
      include: {
        amenities: {
          include: {
            amenity: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Vehicle update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'IN_PROGRESS']
            }
          }
        }
      }
    })

    if (!existingVehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      )
    }

    // Check if vehicle has active bookings
    if (existingVehicle.bookings.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete vehicle with active bookings" },
        { status: 400 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.vehicle.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      message: "Vehicle deleted successfully"
    })

  } catch (error) {
    console.error("Vehicle deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
