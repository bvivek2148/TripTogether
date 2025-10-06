import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin (you would implement proper admin role checking)
    // For now, we'll allow any authenticated user to access admin stats
    // In production, you'd check user.role === 'ADMIN' or similar

    // Get basic counts
    const [
      totalUsers,
      totalVehicles,
      totalBookings,
      activeBookings,
      pendingPayments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vehicle.count(),
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          status: {
            in: ['CONFIRMED', 'IN_PROGRESS']
          }
        }
      }),
      prisma.booking.count({
        where: {
          paymentStatus: 'PENDING'
        }
      })
    ])

    // Calculate total revenue
    const revenueResult = await prisma.booking.aggregate({
      where: {
        status: 'COMPLETED'
      },
      _sum: {
        totalCost: true
      }
    })
    const totalRevenue = revenueResult._sum.totalCost || 0

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        vehicle: {
          select: {
            name: true,
            type: true
          }
        }
      }
    })

    // Get top performing vehicles
    const topVehiclesData = await prisma.booking.groupBy({
      by: ['vehicleId'],
      where: {
        status: 'COMPLETED'
      },
      _count: {
        id: true
      },
      _sum: {
        totalCost: true
      },
      orderBy: {
        _sum: {
          totalCost: 'desc'
        }
      },
      take: 10
    })

    // Get vehicle details for top vehicles
    const topVehicles = await Promise.all(
      topVehiclesData.map(async (vehicleData) => {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: vehicleData.vehicleId },
          select: {
            id: true,
            name: true,
            type: true
          }
        })
        
        return {
          id: vehicle?.id || '',
          name: vehicle?.name || 'Unknown Vehicle',
          type: vehicle?.type || 'Unknown',
          bookingCount: vehicleData._count.id,
          revenue: vehicleData._sum.totalCost || 0
        }
      })
    )

    // Get revenue by month for the last 12 months
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const monthlyRevenue = await prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: twelveMonthsAgo
        }
      },
      _count: {
        id: true
      },
      _sum: {
        totalCost: true
      }
    })

    // Process monthly revenue data
    const revenueByMonth = monthlyRevenue.reduce((acc, booking) => {
      const month = booking.createdAt.toISOString().slice(0, 7) // YYYY-MM format
      const existingMonth = acc.find(item => item.month === month)
      
      if (existingMonth) {
        existingMonth.revenue += booking._sum.totalCost || 0
        existingMonth.bookings += booking._count.id
      } else {
        acc.push({
          month,
          revenue: booking._sum.totalCost || 0,
          bookings: booking._count.id
        })
      }
      
      return acc
    }, [] as Array<{ month: string; revenue: number; bookings: number }>)

    // Sort by month
    revenueByMonth.sort((a, b) => a.month.localeCompare(b.month))

    // Format recent bookings
    const formattedRecentBookings = recentBookings.map(booking => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      user: {
        name: booking.user.name || 'Unknown User',
        email: booking.user.email
      },
      vehicle: {
        name: booking.vehicle.name,
        type: booking.vehicle.type
      },
      totalCost: booking.totalCost,
      status: booking.status,
      createdAt: booking.createdAt.toISOString()
    }))

    const stats = {
      totalUsers,
      totalVehicles,
      totalBookings,
      totalRevenue,
      activeBookings,
      pendingPayments,
      recentBookings: formattedRecentBookings,
      topVehicles,
      revenueByMonth
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Admin stats fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Get detailed analytics
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
    const { startDate, endDate, groupBy = 'day' } = body

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    const end = endDate ? new Date(endDate) : new Date()

    // Get bookings in date range
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      include: {
        vehicle: {
          select: {
            type: true,
            category: true
          }
        }
      }
    })

    // Group bookings by specified period
    const groupedData = bookings.reduce((acc, booking) => {
      let key: string
      const date = booking.createdAt

      switch (groupBy) {
        case 'hour':
          key = date.toISOString().slice(0, 13) // YYYY-MM-DDTHH
          break
        case 'day':
          key = date.toISOString().slice(0, 10) // YYYY-MM-DD
          break
        case 'week':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().slice(0, 10)
          break
        case 'month':
          key = date.toISOString().slice(0, 7) // YYYY-MM
          break
        default:
          key = date.toISOString().slice(0, 10)
      }

      if (!acc[key]) {
        acc[key] = {
          period: key,
          bookings: 0,
          revenue: 0,
          cabs: 0,
          buses: 0,
          completed: 0,
          cancelled: 0
        }
      }

      acc[key].bookings++
      acc[key].revenue += booking.totalCost
      
      if (booking.vehicle.type === 'CAB') {
        acc[key].cabs++
      } else {
        acc[key].buses++
      }

      if (booking.status === 'COMPLETED') {
        acc[key].completed++
      } else if (booking.status === 'CANCELLED') {
        acc[key].cancelled++
      }

      return acc
    }, {} as Record<string, any>)

    // Convert to array and sort
    const analytics = Object.values(groupedData).sort((a: any, b: any) => 
      a.period.localeCompare(b.period)
    )

    // Calculate summary statistics
    const summary = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalCost, 0),
      averageBookingValue: bookings.length > 0 
        ? bookings.reduce((sum, booking) => sum + booking.totalCost, 0) / bookings.length 
        : 0,
      completionRate: bookings.length > 0
        ? (bookings.filter(b => b.status === 'COMPLETED').length / bookings.length) * 100
        : 0,
      cancellationRate: bookings.length > 0
        ? (bookings.filter(b => b.status === 'CANCELLED').length / bookings.length) * 100
        : 0,
      cabBookings: bookings.filter(b => b.vehicle.type === 'CAB').length,
      busBookings: bookings.filter(b => b.vehicle.type === 'BUS').length
    }

    return NextResponse.json({
      analytics,
      summary,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        groupBy
      }
    })

  } catch (error) {
    console.error("Admin analytics error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
