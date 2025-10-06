import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">TripTogether</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/vehicles" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Browse Vehicles
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Contact
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Terms of <span className="text-blue-600">Service</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please read these terms carefully before using our transportation services.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: January 15, 2024
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                Welcome to TripTogether! These Terms of Service ("Terms") govern your use of our transportation 
                platform, website, and mobile application operated by TripTogether India Pvt. Ltd. ("we," "our," or "us").
              </p>
              <p className="text-gray-600">
                By accessing or using our services, you agree to be bound by these Terms. If you disagree with 
                any part of these terms, you may not access our services.
              </p>
            </section>

            {/* Service Description */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-600 mb-4">
                TripTogether provides a technology platform that connects users with independent transportation 
                providers for cab rental and bus hiring services across India. We facilitate bookings but do not 
                directly provide transportation services.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Available Services</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Cab rental services for personal and business use</li>
                <li>Bus hiring for group travel and events</li>
                <li>Airport transfers and intercity travel</li>
                <li>Corporate transportation solutions</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-600 mb-4">
                To use our services, you must create an account and provide accurate, complete information. 
                You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Eligibility</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>You must be at least 18 years old to use our services</li>
                <li>You must have the legal capacity to enter into contracts</li>
                <li>You must provide valid identification when required</li>
                <li>You must comply with all applicable laws and regulations</li>
              </ul>
            </section>

            {/* Booking and Payment */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Booking and Payment</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Booking Process</h3>
              <p className="text-gray-600 mb-4">
                All bookings are subject to availability and confirmation. We reserve the right to cancel 
                or modify bookings due to unforeseen circumstances, safety concerns, or force majeure events.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Pricing and Payment</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>All prices are displayed in Indian Rupees (INR) and include applicable taxes</li>
                <li>Payment must be made through our approved payment methods</li>
                <li>Additional charges may apply for tolls, parking, and waiting time</li>
                <li>Cancellation charges may apply as per our cancellation policy</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Cancellation Policy</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Free cancellation up to 2 hours before scheduled pickup</li>
                <li>50% charge for cancellations within 2 hours of pickup</li>
                <li>100% charge for no-shows or cancellations after pickup time</li>
                <li>Weather-related cancellations may be eligible for full refund</li>
              </ul>
            </section>

            {/* User Responsibilities */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Responsibilities</h2>
              <p className="text-gray-600 mb-4">As a user of our services, you agree to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide accurate booking information and be present at pickup locations</li>
                <li>Treat drivers and vehicles with respect and care</li>
                <li>Follow all safety instructions and wear seatbelts</li>
                <li>Not engage in illegal activities or carry prohibited items</li>
                <li>Pay all charges promptly and in full</li>
                <li>Report any issues or incidents immediately</li>
                <li>Not smoke, consume alcohol, or use drugs in vehicles</li>
                <li>Supervise children and ensure their safety during travel</li>
              </ul>
            </section>

            {/* Prohibited Uses */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Uses</h2>
              <p className="text-gray-600 mb-4">You may not use our services for:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Any unlawful purpose or to solicit unlawful acts</li>
                <li>Harassing, abusing, or harming drivers or other users</li>
                <li>Transmitting viruses or malicious code</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Impersonating others or providing false information</li>
                <li>Commercial use without our written permission</li>
                <li>Reverse engineering or copying our technology</li>
              </ul>
            </section>

            {/* Safety and Liability */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Safety and Liability</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Safety Measures</h3>
              <p className="text-gray-600 mb-4">
                We implement various safety measures including driver verification, vehicle inspections, 
                and real-time tracking. However, you acknowledge that transportation involves inherent risks.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Limitation of Liability</h3>
              <p className="text-gray-600 mb-4">
                Our liability is limited to the maximum extent permitted by law. We are not liable for 
                indirect, incidental, or consequential damages arising from your use of our services.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 Insurance</h3>
              <p className="text-gray-600">
                All vehicles on our platform carry appropriate insurance coverage as required by Indian law. 
                Additional insurance options may be available upon request.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                Our platform, including all content, features, and functionality, is owned by TripTogether 
                and protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-600">
                You may not reproduce, distribute, modify, or create derivative works without our express 
                written permission.
              </p>
            </section>

            {/* Privacy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Privacy</h2>
              <p className="text-gray-600">
                Your privacy is important to us. Please review our Privacy Policy, which explains how we 
                collect, use, and protect your information. By using our services, you consent to our 
                privacy practices.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-600 mb-4">
                We may terminate or suspend your account immediately, without prior notice, for conduct 
                that we believe violates these Terms or is harmful to other users or our business.
              </p>
              <p className="text-gray-600">
                You may terminate your account at any time by contacting our customer support. 
                Upon termination, your right to use our services will cease immediately.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Dispute Resolution</h2>
              <p className="text-gray-600 mb-4">
                Any disputes arising from these Terms or your use of our services will be resolved through 
                binding arbitration in accordance with the Arbitration and Conciliation Act, 2015.
              </p>
              <p className="text-gray-600">
                The arbitration will be conducted in Gurgaon, Haryana, India, and governed by Indian law.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-600">
                We reserve the right to modify these Terms at any time. We will notify you of any material 
                changes by posting the updated Terms on our website. Your continued use of our services 
                after such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-600">
                These Terms are governed by and construed in accordance with the laws of India, 
                without regard to conflict of law principles.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-900 font-medium mb-2">TripTogether India Pvt. Ltd.</p>
                <p className="text-gray-600 mb-1">Email: legal@triptogether.in</p>
                <p className="text-gray-600 mb-1">Phone: +91 1800-123-4567</p>
                <p className="text-gray-600">
                  Address: 123 Business Park, Sector 18, Gurgaon, Haryana 122015, India
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="ml-2 text-xl font-bold">TripTogether</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Your trusted transportation partner across India. Safe, reliable, and affordable cab rentals and bus hiring services.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Services</h3>
              <ul className="space-y-2">
                <li><Link href="/vehicles?type=CAB" className="text-gray-300 hover:text-white transition-colors">Cab Rental</Link></li>
                <li><Link href="/vehicles?type=BUS" className="text-gray-300 hover:text-white transition-colors">Bus Hiring</Link></li>
                <li><Link href="/vehicles" className="text-gray-300 hover:text-white transition-colors">All Vehicles</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              © 2024 TripTogether India. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
