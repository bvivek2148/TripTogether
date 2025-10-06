import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { BookingStatus } from "@prisma/client"

// Booking update schema
const updateBookingSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
  cancellationReason: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          include: {
            amenities: {
              include: {
                amenity: true
              }
            }
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
                category: true,
                description: true
              }
            }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        notifications: {
          orderBy: { sentAt: 'desc' },
          take: 10
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Check if user owns this booking or is admin
    if (booking.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Parse JSON fields
    const formattedBooking = {
      ...booking,
      vehicle: {
        ...booking.vehicle,
        features: booking.vehicle.features ? JSON.parse(booking.vehicle.features) : [],
        images: booking.vehicle.images ? JSON.parse(booking.vehicle.images) : []
      }
    }

    return NextResponse.json({ booking: formattedBooking })

  } catch (error) {
    console.error("Booking fetch error:", error)
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateBookingSchema.parse(body)

    // Check if booking exists and user has access
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        vehicle: true
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Check if user owns this booking or is admin
    if (existingBooking.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Validate status transitions
    if (validatedData.status) {
      const validTransitions: Record<BookingStatus, BookingStatus[]> = {
        [BookingStatus.DRAFT]: [BookingStatus.PENDING_PAYMENT, BookingStatus.CANCELLED],
        [BookingStatus.PENDING_PAYMENT]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
        [BookingStatus.CONFIRMED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
        [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
        [BookingStatus.COMPLETED]: [], // Cannot change from completed
        [BookingStatus.CANCELLED]: [], // Cannot change from cancelled
        [BookingStatus.REFUNDED]: [] // Cannot change from refunded
      }

      const allowedStatuses = validTransitions[existingBooking.status]
      if (!allowedStatuses.includes(validatedData.status)) {
        return NextResponse.json(
          { error: `Cannot change status from ${existingBooking.status} to ${validatedData.status}` },
          { status: 400 }
        )
      }

      // Check if cancellation is allowed (must be at least 24 hours before start)
      if (validatedData.status === BookingStatus.CANCELLED) {
        const hoursUntilStart = (existingBooking.startDateTime.getTime() - Date.now()) / (1000 * 60 * 60)
        if (hoursUntilStart < 24 && session.user.role !== 'ADMIN') {
          return NextResponse.json(
            { error: "Bookings can only be cancelled at least 24 hours before the start time" },
            { status: 400 }
          )
        }

        // Require cancellation reason
        if (!validatedData.cancellationReason) {
          return NextResponse.json(
            { error: "Cancellation reason is required" },
            { status: 400 }
          )
        }
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.status) {
      updateData.status = validatedData.status
      
      if (validatedData.status === BookingStatus.CANCELLED) {
        updateData.cancellationDate = new Date()
        updateData.cancellationReason = validatedData.cancellationReason
        
        // Calculate refund amount based on cancellation policy
        const hoursUntilStart = (existingBooking.startDateTime.getTime() - Date.now()) / (1000 * 60 * 60)
        let refundPercentage = 0
        
        if (hoursUntilStart >= 72) {
          refundPercentage = 1.0 // 100% refund
        } else if (hoursUntilStart >= 48) {
          refundPercentage = 0.75 // 75% refund
        } else if (hoursUntilStart >= 24) {
          refundPercentage = 0.5 // 50% refund
        }
        
        updateData.refundAmount = existingBooking.totalCost * refundPercentage
      }
    }

    if (validatedData.specialRequests !== undefined) {
      updateData.specialRequests = validatedData.specialRequests
    }

    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
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
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    // Create notification for status change
    if (validatedData.status) {
      await prisma.bookingNotification.create({
        data: {
          bookingId: id,
          type: validatedData.status === BookingStatus.CANCELLED ? 'BOOKING_CANCELLED' : 'BOOKING_CONFIRMED',
          title: `Booking ${validatedData.status}`,
          message: `Your booking ${existingBooking.bookingReference} has been ${validatedData.status.toLowerCase()}`,
          data: JSON.stringify({
            bookingId: id,
            newStatus: validatedData.status,
            refundAmount: updateData.refundAmount
          })
        }
      })
    }

    return NextResponse.json({
      message: "Booking updated successfully",
      booking: updatedBooking
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Booking update error:", error)
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if booking exists and user has access
    const existingBooking = await prisma.booking.findUnique({
      where: { id }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Check if user owns this booking or is admin
    if (existingBooking.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Only allow deletion of draft bookings
    if (existingBooking.status !== BookingStatus.DRAFT) {
      return NextResponse.json(
        { error: "Only draft bookings can be deleted. Use cancellation for confirmed bookings." },
        { status: 400 }
      )
    }

    // Delete booking and related data
    await prisma.$transaction(async (tx) => {
      // Delete related records first
      await tx.bookingRoute.deleteMany({
        where: { bookingId: id }
      })

      await tx.bookingAmenity.deleteMany({
        where: { bookingId: id }
      })

      await tx.bookingNotification.deleteMany({
        where: { bookingId: id }
      })

      // Delete the booking
      await tx.booking.delete({
        where: { id }
      })
    })

    return NextResponse.json({
      message: "Booking deleted successfully"
    })

  } catch (error) {
    console.error("Booking deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
