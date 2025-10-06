import { Loader } from '@googlemaps/js-api-loader'

// Google Maps configuration
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

let googleMapsLoader: Loader | null = null
let isGoogleMapsLoaded = false

// Initialize Google Maps loader
export const initializeGoogleMaps = () => {
  if (!googleMapsLoader && GOOGLE_MAPS_API_KEY) {
    googleMapsLoader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry', 'directions']
    })
  }
  return googleMapsLoader
}

// Load Google Maps API
export const loadGoogleMaps = async (): Promise<typeof google.maps | null> => {
  if (isGoogleMapsLoaded && window.google?.maps) {
    return window.google.maps
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not found')
    return null
  }

  try {
    const loader = initializeGoogleMaps()
    if (!loader) return null

    await loader.load()
    isGoogleMapsLoaded = true
    return window.google.maps
  } catch (error) {
    console.error('Failed to load Google Maps:', error)
    return null
  }
}

// Calculate distance and duration between two points
export const calculateRoute = async (
  origin: string | google.maps.LatLngLiteral,
  destination: string | google.maps.LatLngLiteral,
  waypoints?: Array<{ location: string | google.maps.LatLngLiteral; stopover: boolean }>
): Promise<{
  distance: { text: string; value: number }
  duration: { text: string; value: number }
  route: google.maps.DirectionsRoute
} | null> => {
  const maps = await loadGoogleMaps()
  if (!maps) return null

  return new Promise((resolve, reject) => {
    const directionsService = new maps.DirectionsService()

    const request: google.maps.DirectionsRequest = {
      origin,
      destination,
      waypoints,
      travelMode: maps.TravelMode.DRIVING,
      unitSystem: maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    }

    directionsService.route(request, (result, status) => {
      if (status === maps.DirectionsStatus.OK && result) {
        const route = result.routes[0]
        const leg = route.legs[0]
        
        resolve({
          distance: leg.distance!,
          duration: leg.duration!,
          route
        })
      } else {
        reject(new Error(`Directions request failed: ${status}`))
      }
    })
  })
}

// Calculate distance between multiple points
export const calculateMultiStopRoute = async (
  stops: Array<string | google.maps.LatLngLiteral>
): Promise<{
  totalDistance: number
  totalDuration: number
  legs: Array<{
    distance: { text: string; value: number }
    duration: { text: string; value: number }
    startAddress: string
    endAddress: string
  }>
  route: google.maps.DirectionsRoute
} | null> => {
  if (stops.length < 2) return null

  const maps = await loadGoogleMaps()
  if (!maps) return null

  const origin = stops[0]
  const destination = stops[stops.length - 1]
  const waypoints = stops.slice(1, -1).map(stop => ({
    location: stop,
    stopover: true
  }))

  try {
    const result = await calculateRoute(origin, destination, waypoints)
    if (!result) return null

    const route = result.route
    let totalDistance = 0
    let totalDuration = 0
    
    const legs = route.legs.map(leg => {
      totalDistance += leg.distance?.value || 0
      totalDuration += leg.duration?.value || 0
      
      return {
        distance: leg.distance!,
        duration: leg.duration!,
        startAddress: leg.start_address,
        endAddress: leg.end_address
      }
    })

    return {
      totalDistance,
      totalDuration,
      legs,
      route
    }
  } catch (error) {
    console.error('Multi-stop route calculation failed:', error)
    return null
  }
}

// Geocode an address to get coordinates
export const geocodeAddress = async (
  address: string
): Promise<google.maps.LatLngLiteral | null> => {
  const maps = await loadGoogleMaps()
  if (!maps) return null

  return new Promise((resolve, reject) => {
    const geocoder = new maps.Geocoder()

    geocoder.geocode({ address }, (results, status) => {
      if (status === maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location
        resolve({
          lat: location.lat(),
          lng: location.lng()
        })
      } else {
        reject(new Error(`Geocoding failed: ${status}`))
      }
    })
  })
}

// Get address from coordinates (reverse geocoding)
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  const maps = await loadGoogleMaps()
  if (!maps) return null

  return new Promise((resolve, reject) => {
    const geocoder = new maps.Geocoder()
    const latlng = { lat, lng }

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === maps.GeocoderStatus.OK && results && results[0]) {
        resolve(results[0].formatted_address)
      } else {
        reject(new Error(`Reverse geocoding failed: ${status}`))
      }
    })
  })
}

// Calculate distance between two coordinates using Haversine formula
export const calculateDistanceHaversine = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in kilometers
}

// Convert degrees to radians
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}

// Get current user location
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

// Format distance for display
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  } else {
    return `${(meters / 1000).toFixed(1)} km`
  }
}

// Format duration for display
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

// Pricing calculation based on distance and time (Indian rates)
export const calculateDistanceBasedPricing = (
  baseRate: number,
  distanceKm: number,
  durationMinutes: number,
  options: {
    perKmRate?: number
    perMinuteRate?: number
    minimumFare?: number
    peakHourMultiplier?: number
    isPeakHour?: boolean
  } = {}
): {
  basePrice: number
  distancePrice: number
  timePrice: number
  peakSurcharge: number
  totalPrice: number
} => {
  const {
    perKmRate = 12.0, // ₹12 per km for cabs (Indian market rate)
    perMinuteRate = 1.5, // ₹1.5 per minute
    minimumFare = 80.0, // ₹80 minimum fare
    peakHourMultiplier = 1.3, // Lower peak multiplier for Indian market
    isPeakHour = false
  } = options

  const basePrice = baseRate
  const distancePrice = distanceKm * perKmRate
  const timePrice = durationMinutes * perMinuteRate
  
  let subtotal = basePrice + distancePrice + timePrice
  subtotal = Math.max(subtotal, minimumFare)
  
  const peakSurcharge = isPeakHour ? subtotal * (peakHourMultiplier - 1) : 0
  const totalPrice = subtotal + peakSurcharge

  return {
    basePrice,
    distancePrice,
    timePrice,
    peakSurcharge,
    totalPrice
  }
}

// Check if current time is peak hour
export const isPeakHour = (date: Date = new Date()): boolean => {
  const hour = date.getHours()
  const dayOfWeek = date.getDay()
  
  // Peak hours: 7-9 AM and 5-7 PM on weekdays
  const isMorningPeak = hour >= 7 && hour < 9
  const isEveningPeak = hour >= 17 && hour < 19
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
  
  return isWeekday && (isMorningPeak || isEveningPeak)
}
