import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { createPaymentIntent, handleStripeError } from "@/lib/stripe"
import { z } from "zod"
import { PaymentStatus } from "@prisma/client"

// Payment intent creation schema
const createIntentSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  amount: z.number().min(10, "Amount must be at least ₹10"),
  currency: z.string().default("inr"),
  paymentMethodTypes: z.array(z.string()).optional(),
})

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
    const validatedData = createIntentSchema.parse(body)

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        user: true,
        vehicle: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true
          }
        },
        payments: {
          where: {
            status: {
              in: ['PENDING', 'PROCESSING', 'COMPLETED']
            }
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Check if user owns this booking
    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Check if booking is in correct status
    if (booking.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: "Booking is not pending payment" },
        { status: 400 }
      )
    }

    // Check if there's already a pending payment
    const existingPayment = booking.payments.find(p => 
      p.status === 'PENDING' || p.status === 'PROCESSING'
    )

    if (existingPayment) {
      return NextResponse.json(
        { error: "Payment already in progress" },
        { status: 400 }
      )
    }

    // Verify amount matches booking total
    if (Math.abs(validatedData.amount - booking.totalCost) > 0.01) {
      return NextResponse.json(
        { error: "Payment amount does not match booking total" },
        { status: 400 }
      )
    }

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(
      validatedData.amount,
      validatedData.currency,
      {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        userId: session.user.id,
        vehicleId: booking.vehicleId,
        vehicleName: booking.vehicle.name,
        vehicleType: booking.vehicle.type,
      }
    )

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: validatedData.amount,
        currency: validatedData.currency.toUpperCase(),
        status: PaymentStatus.PENDING,
        paymentMethod: 'STRIPE',
        stripePaymentIntentId: paymentIntent.id,
        metadata: JSON.stringify({
          stripeClientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        })
      }
    })

    // Update booking payment status
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: PaymentStatus.PENDING
      }
    })

    return NextResponse.json({
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
      },
      booking: {
        id: booking.id,
        reference: booking.bookingReference,
        totalCost: booking.totalCost,
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payment parameters", details: error.issues },
        { status: 400 }
      )
    }

    // Handle Stripe errors
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = handleStripeError(error)
      return NextResponse.json(
        { error: stripeError.message, code: stripeError.code },
        { status: 400 }
      )
    }

    console.error("Payment intent creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Get payment intent status
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
    const paymentIntentId = searchParams.get('payment_intent_id')
    const bookingId = searchParams.get('booking_id')

    if (!paymentIntentId && !bookingId) {
      return NextResponse.json(
        { error: "Payment intent ID or booking ID is required" },
        { status: 400 }
      )
    }

    let payment
    if (paymentIntentId) {
      payment = await prisma.payment.findFirst({
        where: {
          stripePaymentIntentId: paymentIntentId,
          booking: {
            userId: session.user.id
          }
        },
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
              totalCost: true,
              status: true
            }
          }
        }
      })
    } else if (bookingId) {
      payment = await prisma.payment.findFirst({
        where: {
          bookingId,
          booking: {
            userId: session.user.id
          }
        },
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
              totalCost: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
      },
      booking: payment.booking
    })

  } catch (error) {
    console.error("Payment status fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
