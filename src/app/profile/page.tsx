"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/ui/loading"
import { formatCurrency, formatDate } from "@/lib/utils"

interface UserProfile {
  user: {
    id: string
    name: string
    email: string
    phone?: string
    preferences: {
      preferredVehicleType?: string
      preferredCategory?: string
      defaultPickupLocation?: string
      preferredAmenities?: string[]
      notificationPreferences?: {
        email: boolean
        sms: boolean
        push: boolean
        bookingConfirmation: boolean
        paymentUpdates: boolean
        promotions: boolean
      }
      paymentPreferences?: {
        savePaymentMethods: boolean
        autoPayment: boolean
        preferredCurrency: string
      }
      bookingPreferences?: {
        defaultPassengerCount: number
        requireConfirmation: boolean
        allowSharedRides: boolean
      }
    }
  }
  stats: {
    totalBookings: number
    totalSpent: number
    favoriteVehicles: number
    memberSince: string
  }
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchUserProfile()
    }
  }, [status, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (preferences: any) => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      })

      if (response.ok) {
        const data = await response.json()
        setUserProfile(prev => prev ? { ...prev, user: data.user } : null)
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    if (!userProfile) return
    
    const updatedPreferences = {
      ...userProfile.user.preferences,
      notificationPreferences: {
        ...userProfile.user.preferences.notificationPreferences,
        [key]: value
      }
    }
    
    updatePreferences(updatedPreferences)
  }

  const handlePaymentChange = (key: string, value: any) => {
    if (!userProfile) return
    
    const updatedPreferences = {
      ...userProfile.user.preferences,
      paymentPreferences: {
        ...userProfile.user.preferences.paymentPreferences,
        [key]: value
      }
    }
    
    updatePreferences(updatedPreferences)
  }

  const handleBookingChange = (key: string, value: any) => {
    if (!userProfile) return
    
    const updatedPreferences = {
      ...userProfile.user.preferences,
      bookingPreferences: {
        ...userProfile.user.preferences.bookingPreferences,
        [key]: value
      }
    }
    
    updatePreferences(updatedPreferences)
  }

  if (status === "loading" || loading) {
    return <Loading />
  }

  if (!session || !userProfile) {
    return null
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'payment', label: 'Payment', icon: '💳' },
    { id: 'booking', label: 'Booking', icon: '📅' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="mt-2 text-gray-600">Manage your account and preferences</p>
            </div>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {userProfile.user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{userProfile.user.name}</h3>
                  <p className="text-sm text-gray-600">{userProfile.user.email}</p>
                </div>

                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Bookings:</span>
                  <span className="font-medium">{userProfile.stats.totalBookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Spent:</span>
                  <span className="font-medium">{formatCurrency(userProfile.stats.totalSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Favorites:</span>
                  <span className="font-medium">{userProfile.stats.favoriteVehicles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Member Since:</span>
                  <span className="font-medium">{formatDate(userProfile.stats.memberSince)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <Input
                        value={userProfile.user.name}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        value={userProfile.user.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        value={userProfile.user.phone || ''}
                        placeholder="Add phone number"
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Pickup Location
                      </label>
                      <Input
                        value={userProfile.user.preferences.defaultPickupLocation || ''}
                        placeholder="Set default pickup location"
                        onChange={(e) => updatePreferences({
                          ...userProfile.user.preferences,
                          defaultPickupLocation: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Vehicle Type
                      </label>
                      <select
                        value={userProfile.user.preferences.preferredVehicleType || ''}
                        onChange={(e) => updatePreferences({
                          ...userProfile.user.preferences,
                          preferredVehicleType: e.target.value
                        })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="">No preference</option>
                        <option value="CAB">Cab</option>
                        <option value="BUS">Bus</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Category
                      </label>
                      <select
                        value={userProfile.user.preferences.preferredCategory || ''}
                        onChange={(e) => updatePreferences({
                          ...userProfile.user.preferences,
                          preferredCategory: e.target.value
                        })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="">No preference</option>
                        <option value="ECONOMY_CAB">Economy Cab</option>
                        <option value="STANDARD_CAB">Standard Cab</option>
                        <option value="PREMIUM_CAB">Premium Cab</option>
                        <option value="LUXURY_CAB">Luxury Cab</option>
                        <option value="MINI_BUS">Mini Bus</option>
                        <option value="STANDARD_BUS">Standard Bus</option>
                        <option value="LARGE_BUS">Large Bus</option>
                        <option value="LUXURY_BUS">Luxury Bus</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                      { key: 'sms', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
                      { key: 'push', label: 'Push Notifications', description: 'Receive browser push notifications' },
                      { key: 'bookingConfirmation', label: 'Booking Confirmations', description: 'Get notified when bookings are confirmed' },
                      { key: 'paymentUpdates', label: 'Payment Updates', description: 'Get notified about payment status changes' },
                      { key: 'promotions', label: 'Promotions & Offers', description: 'Receive promotional offers and discounts' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={userProfile.user.preferences.notificationPreferences?.[item.key as keyof typeof userProfile.user.preferences.notificationPreferences] || false}
                            onChange={(e) => handleNotificationChange(item.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Save Payment Methods</h4>
                        <p className="text-sm text-gray-600">Securely save payment methods for faster checkout</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userProfile.user.preferences.paymentPreferences?.savePaymentMethods || false}
                          onChange={(e) => handlePaymentChange('savePaymentMethods', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Auto Payment</h4>
                        <p className="text-sm text-gray-600">Automatically process payments for confirmed bookings</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userProfile.user.preferences.paymentPreferences?.autoPayment || false}
                          onChange={(e) => handlePaymentChange('autoPayment', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Currency
                      </label>
                      <select
                        value={userProfile.user.preferences.paymentPreferences?.preferredCurrency || 'INR'}
                        onChange={(e) => handlePaymentChange('preferredCurrency', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'booking' && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Passenger Count
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={userProfile.user.preferences.bookingPreferences?.defaultPassengerCount || 1}
                      onChange={(e) => handleBookingChange('defaultPassengerCount', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Require Confirmation</h4>
                        <p className="text-sm text-gray-600">Require manual confirmation before processing bookings</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userProfile.user.preferences.bookingPreferences?.requireConfirmation || false}
                          onChange={(e) => handleBookingChange('requireConfirmation', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Allow Shared Rides</h4>
                        <p className="text-sm text-gray-600">Allow sharing rides with other passengers for lower costs</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userProfile.user.preferences.bookingPreferences?.allowSharedRides || false}
                          onChange={(e) => handleBookingChange('allowSharedRides', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {saving && (
              <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                Saving preferences...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
