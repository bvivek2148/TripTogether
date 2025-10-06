import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// User preferences schema
const preferencesSchema = z.object({
  preferredVehicleType: z.enum(['CAB', 'BUS']).optional(),
  preferredCategory: z.enum([
    'ECONOMY_CAB', 'STANDARD_CAB', 'PREMIUM_CAB', 'LUXURY_CAB',
    'MINI_BUS', 'STANDARD_BUS', 'LARGE_BUS', 'LUXURY_BUS'
  ]).optional(),
  defaultPickupLocation: z.string().optional(),
  preferredAmenities: z.array(z.string()).optional(),
  notificationPreferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
    bookingConfirmation: z.boolean().default(true),
    paymentUpdates: z.boolean().default(true),
    promotions: z.boolean().default(false),
  }).optional(),
  paymentPreferences: z.object({
    savePaymentMethods: z.boolean().default(true),
    autoPayment: z.boolean().default(false),
    preferredCurrency: z.string().default('INR'),
  }).optional(),
  bookingPreferences: z.object({
    defaultPassengerCount: z.number().min(1).max(50).default(1),
    requireConfirmation: z.boolean().default(true),
    allowSharedRides: z.boolean().default(false),
  }).optional(),
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

    // Get user with preferences
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        preferences: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            favorites: true,
            reviews: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Parse preferences or return defaults
    const preferences = user.preferences ? JSON.parse(user.preferences) : {
      notificationPreferences: {
        email: true,
        sms: false,
        push: true,
        bookingConfirmation: true,
        paymentUpdates: true,
        promotions: false,
      },
      paymentPreferences: {
        savePaymentMethods: true,
        autoPayment: false,
        preferredCurrency: 'INR',
      },
      bookingPreferences: {
        defaultPassengerCount: 1,
        requireConfirmation: true,
        allowSharedRides: false,
      }
    }

    return NextResponse.json({
      user: {
        ...user,
        preferences,
        stats: {
          totalBookings: user._count.bookings,
          favoriteVehicles: user._count.favorites,
          reviewsWritten: user._count.reviews
        }
      }
    })

  } catch (error) {
    console.error("User preferences fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = preferencesSchema.parse(body)

    // Get current preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true }
    })

    const currentPreferences = currentUser?.preferences 
      ? JSON.parse(currentUser.preferences) 
      : {}

    // Merge with new preferences
    const updatedPreferences = {
      ...currentPreferences,
      ...validatedData,
      updatedAt: new Date().toISOString()
    }

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferences: JSON.stringify(updatedPreferences)
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        preferences: true
      }
    })

    return NextResponse.json({
      message: "Preferences updated successfully",
      user: {
        ...updatedUser,
        preferences: JSON.parse(updatedUser.preferences || '{}')
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    console.error("User preferences update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Get user profile with booking statistics
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get comprehensive user statistics
    const [user, bookingStats, recentBookings, favoriteVehicles] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          preferences: true,
          createdAt: true,
        }
      }),
      
      // Booking statistics
      prisma.booking.groupBy({
        by: ['status'],
        where: { userId: session.user.id },
        _count: { status: true },
        _sum: { totalCost: true }
      }),
      
      // Recent bookings
      prisma.booking.findMany({
        where: { userId: session.user.id },
        include: {
          vehicle: {
            select: {
              id: true,
              name: true,
              type: true,
              category: true,
              images: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Favorite vehicles count by type
      prisma.userFavorite.groupBy({
        by: ['vehicle'],
        where: { userId: session.user.id },
        _count: { vehicleId: true }
      })
    ])

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Process booking statistics
    const stats = {
      totalBookings: bookingStats.reduce((sum, stat) => sum + stat._count.status, 0),
      totalSpent: bookingStats.reduce((sum, stat) => sum + (stat._sum.totalCost || 0), 0),
      bookingsByStatus: bookingStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status
        return acc
      }, {} as Record<string, number>),
      favoriteVehicles: favoriteVehicles.length,
      memberSince: user.createdAt
    }

    // Format recent bookings
    const formattedRecentBookings = recentBookings.map(booking => ({
      ...booking,
      vehicle: {
        ...booking.vehicle,
        images: booking.vehicle.images ? JSON.parse(booking.vehicle.images) : []
      }
    }))

    return NextResponse.json({
      user: {
        ...user,
        preferences: user.preferences ? JSON.parse(user.preferences) : {}
      },
      stats,
      recentBookings: formattedRecentBookings
    })

  } catch (error) {
    console.error("User profile fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
