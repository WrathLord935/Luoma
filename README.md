# LOOMA - Loop of Maad Apparel

## Basic Details

**Team Name:** CHAI-T

**Team Members:** 
- Tejas K M, Ram Madhav R Kammath, Sufiyan Shiraj Mohammed, Rosphil Maria

**Track / Theme:** Sustainable Fashion & Circular Economy

**Problem Statement:**  
The fast fashion industry generates massive textile waste while consumers lack accessible platforms to circulate pre-loved clothing. Traditional donation and resale processes are inefficient, and there's limited visibility into the environmental impact of individual contributions to sustainable fashion.

**Solution Overview:**  
LOOMA (Loop of Maad Apparel) is a Gen Z-focused textile circulation platform that gamifies sustainable fashion. It enables users to sell, swap, and donate clothing while tracking their environmental impact through real-time stats. The platform features AI-powered upcycling suggestions, a B2B surplus exchange for businesses, and location-based matching for local textile circulation.

**Project Description:**  
LOOMA transforms textile waste into a circular economy by connecting individuals and businesses through an intuitive marketplace. Users can list items for sale, swap, or donation, chat with other users, and discover safe meetup locations. The platform includes:
- **Personal Impact Dashboard:** Track textiles diverted, water saved, and CO2 reduction
- **AI DIY Upcycling:** Get creative project ideas for old garments with AI-generated visuals
- **B2B Surplus Exchange:** Business-exclusive platform for bulk textile trading with smart arbitrage suggestions
- **Real-time Location Tracking:** Find nearby items and users with live geolocation
- **QR-based User Verification:** Secure identity verification for safe transactions

## Technical Details

**Tech Stack:**
- **Frontend:** React 18, Vite
- **Backend & Database:** Supabase (PostgreSQL, Authentication, Real-time subscriptions)
- **Styling:** Custom CSS with Gen Z "Chai" design system
- **APIs & Services:**
  - Supabase Auth for user management
  - OpenAI API for AI-powered upcycling suggestions (or mock service)
  - BigDataCloud / OpenStreetMap for reverse geocoding
  - Navigator Geolocation API for real-time location

**Key Libraries:**
- `lucide-react` - Icon system
- `react-router-dom` - Client-side routing
- Custom hooks: `useAuth`, `useGeolocation`, `useCountUp`

**Implementation Highlights:**
- Row Level Security (RLS) policies for secure data access
- Real-time location tracking with reverse geocoding
- Custom Toast notification system
- Responsive design with hard shadows and glassmorphism effects
- Protected routes for business-only features

## Installation & Execution

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for backend)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd threads26
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Database Setup (Supabase)
1. Go to your Supabase Dashboard → SQL Editor
2. Run the SQL schema provided in `backend_integration_plan.md`
3. This creates the `marketplace_items` table with RLS policies

### Step 5: Run the Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Step 6: Build for Production (Optional)
```bash
npm run build
npm run preview
```

## Deployment / Live Website

**Deployment Status:** To be deployed

**Recommended Platforms:** Vercel, Netlify, or Cloudflare Pages

**Deployment Steps:**
1. Push code to GitHub repository
2. Connect repository to Vercel/Netlify
3. Add environment variables in deployment settings
4. Deploy automatically on push to main branch

## Screenshots

[Screenshots will be added showcasing:]
- Marketplace feed with filtering
- User profile with live location and QR code
- AI-powered upcycling suggestions
- B2B Surplus Exchange dashboard
- Settings page with real-time location integration
- Toast notifications and micro-interactions

## Demo Video

**Link:** [To be added]

A short video demonstrating:
- User registration and authentication
- Browsing marketplace items
- Uploading new items
- AI upcycling feature in action
- Real-time location tracking
- B2B surplus exchange workflow

## Features

### Core Features
✅ User Authentication (Supabase Auth)  
✅ Marketplace Feed (Sell/Swap/Donate)  
✅ Item Upload with Image Support  
✅ Real-time Chat (Mock)  
✅ User Profile with Stats Dashboard  
✅ QR Code User Verification  
✅ Safe Spot Selection for Meetups  

### Advanced Features
✅ **AI DIY Upcycling** - Generate creative project ideas for old garments  
✅ **Real-time Geolocation** - Auto-detect user location with reverse geocoding  
✅ **B2B Surplus Exchange** - Business-exclusive platform for bulk trading  
✅ **Impact Tracking** - Monitor textiles diverted, water saved, CO2 reduction  
✅ **Custom Toast Notifications** - Gen Z-styled feedback system  
✅ **Edit Profile Modal** - Update username, bio, location with backend persistence  

### Design Highlights
- **Gen Z "Chai" Aesthetic:** Bold typography, hard shadows, acid green accents
- **Cyber-Industrial Theme:** Tape measure toggles, shipping container cards, cargo labels
- **Micro-interactions:** Yarn ball logo with spin animation, hover effects, smooth transitions
- **Responsive Layout:** Mobile-first design with adaptive navigation

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## Acknowledgments

- Supabase for backend infrastructure
- Lucide for icon system
- OpenAI for AI capabilities (if used)
- Threads'26 Hackathon for the opportunity

---

**Built with ☕ by Team CHAI-T for Threads'26**
