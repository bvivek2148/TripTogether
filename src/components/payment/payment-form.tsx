"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { formatCurrency } from '@/lib/utils'

interface PaymentFormProps {
  bookingId: string
  amount: number
  currency?: string
  onPaymentSuccess?: (paymentIntent: any) => void
  onPaymentError?: (error: string) => void
}

// Card element options
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
}

function PaymentFormInner({ 
  bookingId, 
  amount, 
  currency = 'usd',
  onPaymentSuccess,
  onPaymentError 
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntent, setPaymentIntent] = useState<any>(null)

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId,
            amount,
            currency,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setClientSecret(data.paymentIntent.clientSecret)
          setPaymentIntent(data.paymentIntent)
        } else {
          setError(data.error || 'Failed to create payment intent')
          onPaymentError?.(data.error || 'Failed to create payment intent')
        }
      } catch (error) {
        const errorMessage = 'Failed to initialize payment'
        setError(errorMessage)
        onPaymentError?.(errorMessage)
      }
    }

    createPaymentIntent()
  }, [bookingId, amount, currency, onPaymentError])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsLoading(true)
    setError('')

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError('Card element not found')
      setIsLoading(false)
      return
    }

    // Confirm payment
    const { error: confirmError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    )

    if (confirmError) {
      setError(confirmError.message || 'Payment failed')
      onPaymentError?.(confirmError.message || 'Payment failed')
    } else if (confirmedPaymentIntent?.status === 'succeeded') {
      onPaymentSuccess?.(confirmedPaymentIntent)
      router.push(`/bookings/${bookingId}?payment=success`)
    }

    setIsLoading(false)
  }

  if (!stripe || !elements) {
    return <Loading />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Details
              </label>
              <div className="p-3 border border-gray-300 rounded-md">
                <CardElement options={cardElementOptions} />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(amount)}
                </span>
              </div>
              {paymentIntent && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">
                    {paymentIntent.currency.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary">
                    {paymentIntent.status}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1"
        >
          {isLoading ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
        </Button>
      </div>
    </form>
  )
}

export function PaymentForm(props: PaymentFormProps) {
  const [stripePromise] = useState(() => getStripe())

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner {...props} />
    </Elements>
  )
}

// Payment status component
interface PaymentStatusProps {
  status: 'success' | 'error' | 'processing'
  message?: string
  amount?: number
  bookingId?: string
}

export function PaymentStatus({ 
  status, 
  message, 
  amount, 
  bookingId 
}: PaymentStatusProps) {
  const router = useRouter()

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return (
          <div className="mx-auto h-16 w-16 text-green-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="mx-auto h-16 w-16 text-red-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      case 'processing':
        return (
          <div className="mx-auto h-16 w-16">
            <Loading size="lg" />
          </div>
        )
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Payment Successful!'
      case 'error':
        return 'Payment Failed'
      case 'processing':
        return 'Processing Payment...'
    }
  }

  const getStatusMessage = () => {
    if (message) return message
    
    switch (status) {
      case 'success':
        return 'Your payment has been processed successfully. Your booking is now confirmed.'
      case 'error':
        return 'There was an issue processing your payment. Please try again.'
      case 'processing':
        return 'Please wait while we process your payment...'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {getStatusIcon()}
          
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {getStatusTitle()}
          </h2>
          
          <p className="mt-2 text-gray-600">
            {getStatusMessage()}
          </p>

          {amount && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Amount Paid</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(amount)}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {status === 'success' && bookingId && (
              <Button
                onClick={() => router.push(`/bookings/${bookingId}`)}
                className="w-full"
              >
                View Booking Details
              </Button>
            )}
            
            {status === 'error' && (
              <Button
                onClick={() => router.back()}
                className="w-full"
              >
                Try Again
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => router.push('/bookings')}
              className="w-full"
            >
              {status === 'success' ? 'View All Bookings' : 'Back to Bookings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
