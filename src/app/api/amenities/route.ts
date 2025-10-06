import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { AmenityCategory } from "@prisma/client"

// Amenity creation schema
const createAmenitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.nativeEnum(AmenityCategory),
  priceModifier: z.number().min(0, "Price modifier must be positive"),
  icon: z.string().optional(),
})

// Amenity search schema
const searchSchema = z.object({
  category: z.nativeEnum(AmenityCategory).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    // Convert string boolean to boolean
    if (params.isActive) {
      params.isActive = params.isActive === 'true'
    }

    const validatedParams = searchSchema.parse(params)
    
    // Build where clause
    const where: any = {}

    if (validatedParams.category) {
      where.category = validatedParams.category
    }

    if (validatedParams.isActive !== undefined) {
      where.isActive = validatedParams.isActive
    } else {
      // Default to active amenities only
      where.isActive = true
    }

    const amenities = await prisma.vehicleAmenity.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: {
            vehicles: true
          }
        }
      }
    })

    // Group amenities by category
    const groupedAmenities = amenities.reduce((acc, amenity) => {
      const category = amenity.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push({
        ...amenity,
        vehicleCount: amenity._count.vehicles
      })
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      amenities,
      groupedAmenities,
      categories: Object.values(AmenityCategory)
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Amenities fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createAmenitySchema.parse(body)

    // Check if amenity with same name already exists
    const existingAmenity = await prisma.vehicleAmenity.findUnique({
      where: { name: validatedData.name }
    })

    if (existingAmenity) {
      return NextResponse.json(
        { error: "Amenity with this name already exists" },
        { status: 400 }
      )
    }

    const amenity = await prisma.vehicleAmenity.create({
      data: validatedData
    })

    return NextResponse.json(
      { message: "Amenity created successfully", amenity },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Amenity creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
