import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyWebhookSignature, mapStripeStatusToPrisma } from "@/lib/stripe"
import { BookingStatus, PaymentStatus } from "@prisma/client"
import Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(body, signature, webhookSecret)
    } catch (error) {
      console.error("Webhook signature verification failed:", error)
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object as Stripe.Dispute)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

// Handle successful payment
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id
      },
      include: {
        booking: true
      }
    })

    if (!payment) {
      console.error(`Payment not found for PaymentIntent: ${paymentIntent.id}`)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        metadata: JSON.stringify({
          ...JSON.parse(payment.metadata || '{}'),
          stripeChargeId: paymentIntent.latest_charge,
          paymentMethod: paymentIntent.payment_method,
        })
      }
    })

    // Update booking status
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.COMPLETED
      }
    })

    // Create confirmation notification
    await prisma.bookingNotification.create({
      data: {
        bookingId: payment.bookingId,
        type: 'BOOKING_CONFIRMED',
        title: 'Payment Successful',
        message: `Your payment of $${payment.amount} has been processed successfully. Your booking is now confirmed.`,
        data: JSON.stringify({
          paymentId: payment.id,
          amount: payment.amount,
          paymentIntentId: paymentIntent.id
        })
      }
    })

    console.log(`Payment succeeded for booking: ${payment.booking.bookingReference}`)

  } catch (error) {
    console.error("Error handling payment success:", error)
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id
      },
      include: {
        booking: true
      }
    })

    if (!payment) {
      console.error(`Payment not found for PaymentIntent: ${paymentIntent.id}`)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        metadata: JSON.stringify({
          ...JSON.parse(payment.metadata || '{}'),
          failureReason: paymentIntent.last_payment_error?.message,
          failureCode: paymentIntent.last_payment_error?.code,
        })
      }
    })

    // Update booking payment status
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: PaymentStatus.FAILED
      }
    })

    // Create failure notification
    await prisma.bookingNotification.create({
      data: {
        bookingId: payment.bookingId,
        type: 'PAYMENT_FAILED',
        title: 'Payment Failed',
        message: `Your payment of $${payment.amount} could not be processed. Please try again or use a different payment method.`,
        data: JSON.stringify({
          paymentId: payment.id,
          amount: payment.amount,
          failureReason: paymentIntent.last_payment_error?.message
        })
      }
    })

    console.log(`Payment failed for booking: ${payment.booking.bookingReference}`)

  } catch (error) {
    console.error("Error handling payment failure:", error)
  }
}

// Handle canceled payment
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id
      }
    })

    if (!payment) {
      console.error(`Payment not found for PaymentIntent: ${paymentIntent.id}`)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.CANCELLED,
        metadata: JSON.stringify({
          ...JSON.parse(payment.metadata || '{}'),
          canceledAt: new Date().toISOString(),
        })
      }
    })

    // Update booking payment status
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: PaymentStatus.CANCELLED
      }
    })

    console.log(`Payment canceled for PaymentIntent: ${paymentIntent.id}`)

  } catch (error) {
    console.error("Error handling payment cancellation:", error)
  }
}

// Handle payment requiring action
async function handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id
      }
    })

    if (!payment) {
      console.error(`Payment not found for PaymentIntent: ${paymentIntent.id}`)
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PENDING,
        metadata: JSON.stringify({
          ...JSON.parse(payment.metadata || '{}'),
          requiresAction: true,
          nextAction: paymentIntent.next_action,
        })
      }
    })

    console.log(`Payment requires action for PaymentIntent: ${paymentIntent.id}`)

  } catch (error) {
    console.error("Error handling payment action required:", error)
  }
}

// Handle charge dispute
async function handleChargeDispute(dispute: Stripe.Dispute) {
  try {
    // Find the payment associated with this charge
    const payment = await prisma.payment.findFirst({
      where: {
        metadata: {
          contains: dispute.charge as string
        }
      },
      include: {
        booking: true
      }
    })

    if (!payment) {
      console.error(`Payment not found for disputed charge: ${dispute.charge}`)
      return
    }

    // Create dispute notification
    await prisma.bookingNotification.create({
      data: {
        bookingId: payment.bookingId,
        type: 'PAYMENT_DISPUTED',
        title: 'Payment Disputed',
        message: `A dispute has been filed for your payment of $${payment.amount}. We will investigate and contact you if needed.`,
        data: JSON.stringify({
          paymentId: payment.id,
          disputeId: dispute.id,
          disputeReason: dispute.reason,
          disputeAmount: dispute.amount / 100,
        })
      }
    })

    console.log(`Dispute created for payment: ${payment.id}`)

  } catch (error) {
    console.error("Error handling charge dispute:", error)
  }
}
