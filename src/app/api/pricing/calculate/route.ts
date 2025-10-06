import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { calculateDistanceBasedPricing, isPeakHour } from "@/lib/maps"

// Pricing calculation schema
const pricingSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  startDateTime: z.string().datetime("Invalid start date"),
  endDateTime: z.string().datetime("Invalid end date"),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().optional(),
  distance: z.number().min(0, "Distance must be positive").optional(),
  duration: z.number().min(0, "Duration must be positive").optional(),
  passengerCount: z.number().min(1, "At least 1 passenger required"),
  selectedAmenities: z.array(z.object({
    amenityId: z.string(),
    quantity: z.number().min(1)
  })).optional(),
  routes: z.array(z.object({
    location: z.string(),
    distance: z.number().optional(),
    duration: z.number().optional()
  })).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = pricingSchema.parse(body)

    // Get vehicle details
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: validatedData.vehicleId },
      include: {
        amenities: {
          include: {
            amenity: true
          }
        }
      }
    })

    if (!vehicle || !vehicle.isActive) {
      return NextResponse.json(
        { error: "Vehicle not found or not available" },
        { status: 404 }
      )
    }

    // Validate dates
    const startDate = new Date(validatedData.startDateTime)
    const endDate = new Date(validatedData.endDateTime)
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    // Calculate trip duration
    const tripDurationMs = endDate.getTime() - startDate.getTime()
    const tripDurationHours = Math.ceil(tripDurationMs / (1000 * 60 * 60))
    const tripDurationDays = Math.ceil(tripDurationHours / 24)
    const tripDurationMinutes = Math.ceil(tripDurationMs / (1000 * 60))

    // Base pricing calculation
    let basePrice = 0
    let pricingType = 'hourly'

    if (tripDurationDays >= 7 && vehicle.weeklyRate) {
      basePrice = vehicle.weeklyRate * Math.ceil(tripDurationDays / 7)
      pricingType = 'weekly'
    } else if (tripDurationDays >= 1) {
      basePrice = vehicle.dailyRate * tripDurationDays
      pricingType = 'daily'
    } else {
      basePrice = vehicle.hourlyRate * tripDurationHours
      pricingType = 'hourly'
    }

    // Distance-based pricing adjustment
    let distanceAdjustment = 0
    let distancePrice = 0
    let timePrice = 0
    let peakSurcharge = 0

    if (validatedData.distance && validatedData.duration) {
      const distanceKm = validatedData.distance / 1000 // Convert meters to km
      const durationMinutes = validatedData.duration / 60 // Convert seconds to minutes

      // Calculate distance-based pricing (Indian market rates)
      const distancePricing = calculateDistanceBasedPricing(
        basePrice,
        distanceKm,
        durationMinutes,
        {
          perKmRate: vehicle.type === 'CAB' ? 12.0 : 8.0, // ₹12/km for cabs, ₹8/km for buses
          perMinuteRate: vehicle.type === 'CAB' ? 1.5 : 1.0, // ₹1.5/min for cabs, ₹1/min for buses
          minimumFare: vehicle.type === 'CAB' ? 80.0 : 300.0, // ₹80 for cabs, ₹300 for buses
          peakHourMultiplier: 1.3, // Lower peak multiplier for Indian market
          isPeakHour: isPeakHour(startDate)
        }
      )

      distancePrice = distancePricing.distancePrice
      timePrice = distancePricing.timePrice
      peakSurcharge = distancePricing.peakSurcharge
      
      // Use distance-based pricing if it's higher than time-based
      if (distancePricing.totalPrice > basePrice) {
        basePrice = distancePricing.basePrice
        distanceAdjustment = distancePrice + timePrice
      }
    }

    // Demand-based pricing adjustment
    const demandMultiplier = await calculateDemandMultiplier(
      validatedData.vehicleId,
      startDate,
      endDate
    )
    const demandAdjustment = basePrice * (demandMultiplier - 1)

    // Passenger count adjustment (for buses)
    let passengerAdjustment = 0
    if (vehicle.type === 'BUS' && validatedData.passengerCount > vehicle.capacity * 0.5) {
      // Additional charge for high occupancy
      passengerAdjustment = basePrice * 0.1
    }

    // Calculate amenity pricing
    let amenityPrice = 0
    const selectedAmenityIds = validatedData.selectedAmenities?.map(a => a.amenityId) || []
    
    if (selectedAmenityIds.length > 0) {
      const amenities = await prisma.vehicleAmenity.findMany({
        where: { id: { in: selectedAmenityIds } }
      })
      
      amenityPrice = amenities.reduce((total, amenity) => {
        const selectedAmenity = validatedData.selectedAmenities?.find(a => a.amenityId === amenity.id)
        const quantity = selectedAmenity?.quantity || 1
        return total + (basePrice * (amenity.priceModifier / 100) * quantity)
      }, 0)
    }

    // Multi-stop route pricing (Indian market rates)
    let routeAdjustment = 0
    if (validatedData.routes && validatedData.routes.length > 2) {
      // Additional charge for multiple stops
      const extraStops = validatedData.routes.length - 2
      routeAdjustment = extraStops * (vehicle.type === 'CAB' ? 25.0 : 75.0) // ₹25 for cabs, ₹75 for buses
    }

    // Calculate subtotal
    const subtotal = basePrice + distanceAdjustment + demandAdjustment + 
                    passengerAdjustment + amenityPrice + routeAdjustment + peakSurcharge

    // Apply minimum fare (Indian market rates)
    const minimumFare = vehicle.type === 'CAB' ? 80.0 : 300.0 // ₹80 for cabs, ₹300 for buses
    const adjustedSubtotal = Math.max(subtotal, minimumFare)

    // Calculate GST (18% in India)
    const taxAmount = adjustedSubtotal * 0.18

    // Calculate total
    const totalCost = adjustedSubtotal + taxAmount

    // Prepare detailed breakdown
    const breakdown = {
      basePrice,
      pricingType,
      adjustments: {
        distance: distancePrice,
        time: timePrice,
        demand: demandAdjustment,
        passengers: passengerAdjustment,
        routes: routeAdjustment,
        peak: peakSurcharge
      },
      amenityPrice,
      subtotal: adjustedSubtotal,
      taxAmount,
      totalCost,
      tripDetails: {
        duration: {
          hours: tripDurationHours,
          days: tripDurationDays,
          minutes: tripDurationMinutes
        },
        distance: validatedData.distance ? {
          meters: validatedData.distance,
          kilometers: validatedData.distance / 1000
        } : null,
        isPeakHour: isPeakHour(startDate),
        demandMultiplier,
        passengerCount: validatedData.passengerCount,
        vehicleCapacity: vehicle.capacity
      }
    }

    return NextResponse.json({
      pricing: breakdown,
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        type: vehicle.type,
        category: vehicle.category,
        hourlyRate: vehicle.hourlyRate,
        dailyRate: vehicle.dailyRate,
        weeklyRate: vehicle.weeklyRate
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid pricing parameters", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Pricing calculation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Calculate demand multiplier based on booking density
async function calculateDemandMultiplier(
  vehicleId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    // Get bookings in the same time period for similar vehicles
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { type: true, category: true, location: true }
    })

    if (!vehicle) return 1.0

    // Check bookings for similar vehicles in the same area and time period
    const timeWindow = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
    const windowStart = new Date(startDate.getTime() - timeWindow)
    const windowEnd = new Date(endDate.getTime() + timeWindow)

    const similarBookings = await prisma.booking.count({
      where: {
        vehicle: {
          type: vehicle.type,
          category: vehicle.category,
          location: vehicle.location
        },
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS']
        },
        OR: [
          {
            AND: [
              { startDateTime: { lte: windowStart } },
              { endDateTime: { gt: windowStart } }
            ]
          },
          {
            AND: [
              { startDateTime: { lt: windowEnd } },
              { endDateTime: { gte: windowEnd } }
            ]
          },
          {
            AND: [
              { startDateTime: { gte: windowStart } },
              { endDateTime: { lte: windowEnd } }
            ]
          }
        ]
      }
    })

    // Get total available vehicles of the same type in the area
    const availableVehicles = await prisma.vehicle.count({
      where: {
        type: vehicle.type,
        category: vehicle.category,
        location: vehicle.location,
        isActive: true,
        status: 'AVAILABLE'
      }
    })

    if (availableVehicles === 0) return 2.0 // High demand if no vehicles available

    // Calculate demand ratio
    const demandRatio = similarBookings / availableVehicles

    // Apply demand multiplier
    if (demandRatio >= 0.8) return 2.0      // Very high demand
    if (demandRatio >= 0.6) return 1.5      // High demand
    if (demandRatio >= 0.4) return 1.25     // Medium demand
    if (demandRatio >= 0.2) return 1.1      // Low demand
    return 1.0                              // Normal demand

  } catch (error) {
    console.error("Error calculating demand multiplier:", error)
    return 1.0 // Default to no adjustment on error
  }
}
