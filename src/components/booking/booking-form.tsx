"use client"

import React, { useState } from "react"

interface Vehicle {
  id: string
  name: string
  location: string
  capacity: number
  amenities: any[]
}

interface BookingFormProps {
  vehicle: Vehicle
  onBookingCreated?: (booking: any) => void
}

export function BookingForm({ vehicle, onBookingCreated }: BookingFormProps) {
  const [formData, setFormData] = useState({
    startDateTime: '',
    endDateTime: '',
    pickupLocation: vehicle.location,
    dropoffLocation: '',
    passengerCount: 1,
    specialRequests: '',
    notes: ''
  })

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle
          </label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <h3 className="font-medium">{vehicle.name}</h3>
            <p className="text-sm text-gray-600">{vehicle.location}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              id="startDateTime"
              value={formData.startDateTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startDateTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              id="endDateTime"
              value={formData.endDateTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endDateTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Location
          </label>
          <input
            type="text"
            id="pickupLocation"
            value={formData.pickupLocation}
            onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="dropoffLocation" className="block text-sm font-medium text-gray-700 mb-1">
            Drop-off Location (Optional)
          </label>
          <input
            type="text"
            id="dropoffLocation"
            value={formData.dropoffLocation}
            onChange={(e) => setFormData(prev => ({ ...prev, dropoffLocation: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="passengerCount" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Passengers
          </label>
          <select
            id="passengerCount"
            value={formData.passengerCount}
            onChange={(e) => setFormData(prev => ({ ...prev, passengerCount: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {Array.from({ length: vehicle.capacity }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} passenger{i > 0 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests (Optional)
          </label>
          <textarea
            id="specialRequests"
            value={formData.specialRequests}
            onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any special requirements or requests..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Booking...' : 'Create Booking'}
        </button>
      </form>
    </div>
  )
}
