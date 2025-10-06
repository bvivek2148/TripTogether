import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// Add/remove favorite schema
const favoriteSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get user's favorite vehicles
    const [favorites, totalCount] = await Promise.all([
      prisma.userFavorite.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          vehicle: {
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
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.userFavorite.count({
        where: {
          userId: session.user.id
        }
      })
    ])

    // Format the response
    const formattedFavorites = favorites.map(favorite => {
      const vehicle = favorite.vehicle
      const avgRating = vehicle.reviews.length > 0
        ? vehicle.reviews.reduce((sum, review) => sum + review.overallRating, 0) / vehicle.reviews.length
        : 0

      return {
        id: favorite.id,
        createdAt: favorite.createdAt,
        vehicle: {
          ...vehicle,
          features: vehicle.features ? JSON.parse(vehicle.features) : [],
          images: vehicle.images ? JSON.parse(vehicle.images) : [],
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: vehicle._count.reviews,
          bookingCount: vehicle._count.bookings,
        }
      }
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      favorites: formattedFavorites,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error("Favorites fetch error:", error)
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
    const validatedData = favoriteSchema.parse(body)

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: validatedData.vehicleId }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      )
    }

    // Check if already favorited
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_vehicleId: {
          userId: session.user.id,
          vehicleId: validatedData.vehicleId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Vehicle already in favorites" },
        { status: 400 }
      )
    }

    // Add to favorites
    const favorite = await prisma.userFavorite.create({
      data: {
        userId: session.user.id,
        vehicleId: validatedData.vehicleId
      },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: "Vehicle added to favorites",
        favorite 
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

    console.error("Add favorite error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Vehicle ID is required" },
        { status: 400 }
      )
    }

    // Find and delete the favorite
    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_vehicleId: {
          userId: session.user.id,
          vehicleId: vehicleId
        }
      }
    })

    if (!favorite) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      )
    }

    await prisma.userFavorite.delete({
      where: {
        id: favorite.id
      }
    })

    return NextResponse.json({
      message: "Vehicle removed from favorites"
    })

  } catch (error) {
    console.error("Remove favorite error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
