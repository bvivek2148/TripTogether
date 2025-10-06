"use client"

import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps } from '@/lib/maps'

interface RouteMapProps {
  origin: string | google.maps.LatLngLiteral
  destination: string | google.maps.LatLngLiteral
  waypoints?: Array<{ location: string | google.maps.LatLngLiteral; stopover: boolean }>
  onRouteCalculated?: (result: {
    distance: { text: string; value: number }
    duration: { text: string; value: number }
    route: google.maps.DirectionsRoute
  }) => void
  onError?: (error: string) => void
  className?: string
  height?: string
}

export function RouteMap({
  origin,
  destination,
  waypoints = [],
  onRouteCalculated,
  onError,
  className = '',
  height = '400px'
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        const maps = await loadGoogleMaps()
        if (!maps || !mapRef.current) {
          throw new Error('Failed to load Google Maps')
        }

        const mapInstance = new maps.Map(mapRef.current, {
          zoom: 13,
          center: { lat: 28.6139, lng: 77.2090 }, // Default to New Delhi, India
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        })

        const renderer = new maps.DirectionsRenderer({
          draggable: false,
          panel: null,
          suppressMarkers: false,
          suppressInfoWindows: false,
        })

        renderer.setMap(mapInstance)
        
        setMap(mapInstance)
        setDirectionsRenderer(renderer)
        setIsLoading(false)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize map'
        setError(errorMessage)
        onError?.(errorMessage)
        setIsLoading(false)
      }
    }

    initMap()
  }, [onError])

  // Calculate and display route
  useEffect(() => {
    if (!map || !directionsRenderer || !origin || !destination) return

    const calculateRoute = async () => {
      try {
        const maps = await loadGoogleMaps()
        if (!maps) throw new Error('Google Maps not loaded')

        const directionsService = new maps.DirectionsService()

        const request: google.maps.DirectionsRequest = {
          origin,
          destination,
          waypoints,
          travelMode: maps.TravelMode.DRIVING,
          unitSystem: maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
          optimizeWaypoints: true,
        }

        directionsService.route(request, (result, status) => {
          if (status === maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result)
            
            const route = result.routes[0]
            const leg = route.legs[0]
            
            // Calculate total distance and duration for multi-leg routes
            let totalDistance = 0
            let totalDuration = 0
            
            route.legs.forEach(routeLeg => {
              totalDistance += routeLeg.distance?.value || 0
              totalDuration += routeLeg.duration?.value || 0
            })

            onRouteCalculated?.({
              distance: {
                text: `${(totalDistance / 1000).toFixed(1)} km`,
                value: totalDistance
              },
              duration: {
                text: formatDuration(totalDuration),
                value: totalDuration
              },
              route
            })

            // Fit map to route bounds
            const bounds = new maps.LatLngBounds()
            route.legs.forEach(routeLeg => {
              bounds.extend(routeLeg.start_location)
              bounds.extend(routeLeg.end_location)
            })
            map.fitBounds(bounds)
          } else {
            const errorMessage = `Route calculation failed: ${status}`
            setError(errorMessage)
            onError?.(errorMessage)
          }
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Route calculation failed'
        setError(errorMessage)
        onError?.(errorMessage)
      }
    }

    calculateRoute()
  }, [map, directionsRenderer, origin, destination, waypoints, onRouteCalculated, onError])

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-600">
          <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm">Failed to load map</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef}
      className={`w-full rounded-lg border border-gray-300 ${className}`}
      style={{ height }}
    />
  )
}

// Location input component with autocomplete
interface LocationInputProps {
  value: string
  onChange: (value: string, coordinates?: google.maps.LatLngLiteral) => void
  placeholder?: string
  className?: string
}

export function LocationInput({ 
  value, 
  onChange, 
  placeholder = "Enter location",
  className = ""
}: LocationInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    const initAutocomplete = async () => {
      const maps = await loadGoogleMaps()
      if (!maps || !inputRef.current) return

      const autocompleteInstance = new maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'in' }, // Restrict to India
      })

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace()
        if (place.formatted_address) {
          const coordinates = place.geometry?.location ? {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          } : undefined

          onChange(place.formatted_address, coordinates)
        }
      })

      setAutocomplete(autocompleteInstance)
    }

    initAutocomplete()
  }, [onChange])

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    />
  )
}

// Distance and duration display component
interface RouteInfoProps {
  distance?: { text: string; value: number }
  duration?: { text: string; value: number }
  className?: string
}

export function RouteInfo({ distance, duration, className = "" }: RouteInfoProps) {
  if (!distance || !duration) {
    return null
  }

  return (
    <div className={`flex items-center gap-4 text-sm text-gray-600 ${className}`}>
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{distance.text}</span>
      </div>
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{duration.text}</span>
      </div>
    </div>
  )
}
