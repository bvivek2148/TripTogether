import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Payment intent creation (Indian currency)
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'inr',
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to paise (smallest unit of INR)
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

// Refund processing
export const createRefund = async (
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> => {
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  }

  if (amount) {
    refundParams.amount = Math.round(amount * 100) // Convert to cents
  }

  if (reason) {
    refundParams.reason = reason
  }

  return await stripe.refunds.create(refundParams)
}

// Webhook signature verification
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event => {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

// Customer creation
export const createCustomer = async (
  email: string,
  name?: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Customer> => {
  return await stripe.customers.create({
    email,
    name,
    metadata,
  })
}

// Payment method attachment
export const attachPaymentMethod = async (
  paymentMethodId: string,
  customerId: string
): Promise<Stripe.PaymentMethod> => {
  return await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  })
}

// Format amount for display (Indian currency)
export const formatStripeAmount = (amount: number, currency: string = 'inr'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

// Payment status mapping
export const mapStripeStatusToPrisma = (stripeStatus: string): string => {
  const statusMap: Record<string, string> = {
    'requires_payment_method': 'PENDING',
    'requires_confirmation': 'PENDING',
    'requires_action': 'PENDING',
    'processing': 'PROCESSING',
    'requires_capture': 'PROCESSING',
    'canceled': 'FAILED',
    'succeeded': 'COMPLETED',
  }
  
  return statusMap[stripeStatus] || 'PENDING'
}

// Error handling for Stripe errors
export const handleStripeError = (error: any): { message: string; code?: string } => {
  if (error.type === 'StripeCardError') {
    return {
      message: error.message,
      code: error.code
    }
  } else if (error.type === 'StripeRateLimitError') {
    return {
      message: 'Too many requests made to the API too quickly',
      code: 'rate_limit'
    }
  } else if (error.type === 'StripeInvalidRequestError') {
    return {
      message: 'Invalid parameters were supplied to Stripe\'s API',
      code: 'invalid_request'
    }
  } else if (error.type === 'StripeAPIError') {
    return {
      message: 'An error occurred internally with Stripe\'s API',
      code: 'api_error'
    }
  } else if (error.type === 'StripeConnectionError') {
    return {
      message: 'Some kind of error occurred during the HTTPS communication',
      code: 'connection_error'
    }
  } else if (error.type === 'StripeAuthenticationError') {
    return {
      message: 'You probably used an incorrect API key',
      code: 'authentication_error'
    }
  } else {
    return {
      message: 'An unknown error occurred',
      code: 'unknown_error'
    }
  }
}
