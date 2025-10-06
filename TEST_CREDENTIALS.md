# 🔐 TripTogether Test Credentials

## 📋 Test Accounts for Development & Demo

### 👤 **User Accounts**

#### **1. Vivek Bukka (Primary Test User)**
- **Email**: `vivek.bukka@triptogether.com`
- **Password**: `vivek123`
- **Role**: User
- **Phone**: +91 98765 43210
- **Status**: Verified ✅

#### **2. Demo User**
- **Email**: `demo@triptogether.com`
- **Password**: `demo123`
- **Role**: User
- **Phone**: +91 87654 32109
- **Status**: Verified ✅

#### **3. Test User**
- **Email**: `test@triptogether.com`
- **Password**: `test123`
- **Role**: User
- **Status**: Verified ✅

#### **4. Driver Account**
- **Email**: `driver@triptogether.com`
- **Password**: `driver123`
- **Name**: Rajesh Kumar
- **Role**: User (Driver)
- **Phone**: +91 98765 12345
- **Status**: Verified ✅

### 👨‍💼 **Admin Accounts**

#### **1. Admin User**
- **Email**: `admin@triptogether.com`
- **Password**: `admin123`
- **Role**: Admin
- **Status**: Verified ✅

#### **2. Customer Support**
- **Email**: `support@triptogether.com`
- **Password**: `support123`
- **Name**: Customer Support
- **Role**: Admin
- **Phone**: +91 1800 123 4567
- **Status**: Verified ✅

---

## 🚗 **Available Vehicles for Testing**

### **Cabs**
- Economy Cab - Maruti Swift Dzire
- Standard Cab - Honda City
- Premium Cab - Toyota Camry
- Luxury Cab - Mercedes E-Class

### **Buses**
- Mini Bus (12 seats) - Tempo Traveller
- Standard Bus (35 seats) - Ashok Leyland
- Large Bus (45 seats) - Volvo
- Luxury Bus (40 seats) - Mercedes

### **Bikes & Scooters**
- Honda Activa 6G (Scooter)
- TVS Jupiter 125 (Scooter)
- Hero Splendor Plus (Standard Bike)
- Bajaj Pulsar NS200 (Sports Bike)
- Royal Enfield Classic 350 (Cruiser)
- Ather 450X (Electric Scooter)

---

## 🌍 **Test Locations**

### **Available Cities**
- Mumbai, Maharashtra
- Delhi, NCR
- Bangalore, Karnataka
- Chennai, Tamil Nadu
- Pune, Maharashtra
- Hyderabad, Telangana
- Jaipur, Rajasthan
- Chandigarh, Punjab

---

## 💳 **Payment Testing**

### **Test Payment Methods**
- **Credit Card**: Use test card numbers (Stripe test mode)
- **UPI**: Test UPI IDs available
- **Wallet**: Test wallet integration
- **Cash**: Cash on delivery option

---

## 🔧 **Quick Setup Instructions**

### **1. Seed Database**
```bash
npx prisma db push
npx prisma db seed
```

### **2. Start Development Server**
```bash
npm run dev
```

### **3. Access Application**
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api

---

## 📱 **Testing Scenarios**

### **User Journey Testing**
1. **Sign Up/Sign In** with any test account
2. **Browse Vehicles** by type (Cab/Bus/Bike)
3. **Filter & Search** vehicles by location, price, etc.
4. **View Vehicle Details** with image gallery
5. **Make Booking** with test payment
6. **Manage Bookings** in user dashboard

### **Admin Testing**
1. **Sign In** with admin account
2. **Manage Vehicles** (Add/Edit/Delete)
3. **View Bookings** and manage status
4. **User Management** features
5. **Analytics Dashboard** (if implemented)

---

## 🎯 **Recommended Test Flow**

### **For Vivek Bukka Account**
1. Sign in with `vivek.bukka@triptogether.com` / `vivek123`
2. Browse bikes section (new feature)
3. Book a Royal Enfield Classic 350 for weekend trip
4. Test the new image gallery features
5. Check booking confirmation and details

### **For Demo Purposes**
1. Use `demo@triptogether.com` / `demo123` for client demos
2. Showcase the complete booking flow
3. Demonstrate different vehicle types
4. Show professional UI/UX improvements

---

## 🔒 **Security Notes**

- All passwords are hashed using bcrypt
- Test accounts are for development only
- Change passwords in production
- Verify email functionality in staging
- Test phone number verification

---

## 📞 **Support**

For any issues with test accounts or credentials:
- Check database seeding logs
- Verify Prisma schema is up to date
- Ensure all environment variables are set
- Contact development team for assistance

---

**Last Updated**: January 2024
**Version**: 1.0.0
