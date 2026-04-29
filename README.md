# GolfChain Platform - Full Stack Application

A modern, fully functional golf competition platform with subscriptions, score tracking, leaderboards, monthly draws, and charity integration.

##  ✨ Features Implemented

### ✅ **Landing Page**
- Modern 3D animated hero section
- Animated gradient orbs background
- Statistics cards
- Feature highlights
- Call-to-action buttons
- Responsive design

### ✅ **Authentication System**
- User registration with email & password
- Secure login with JWT tokens
- Session management with localStorage
- Protected routes

### ✅ **Subscription Engine**
- Monthly ($9.99) and Yearly ($99.99) plans
- Subscription status tracking
- Plan management page
- Payment-ready architecture

### ✅ **Score Entry System**
- Stableford format (18-hole golf scoring)
- Front 9 and Back 9 separation
- Real-time point calculation
- Score history display
- Course rating and slope input

### ✅ **Leaderboard**
- Real-time ranking system
- Total points and rounds tracking
- Average points per round
- User highlighting
- Medal system (🥇🥈🥉)

### ✅ **Monthly Draws**
- Random draw selection from active subscribers
- Prize pool system
- Draw results display
- How it works information

### ✅ **Charity Integration**
- Charity selection page
- Support tracking (20% of subscriptions)
- Multiple charities available
- Impact statistics

### ✅ **User Dashboard**
- Profile information
- Subscription status
- Score statistics
- Quick action cards
- Mobile-responsive navigation

---

## 🚀 Getting Started

### **Frontend Setup**

```bash
cd client/golf-client
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

### **Backend Setup**

```bash
cd server
npm install
npm start
```

Backend API runs at: **http://localhost:5000**

---

## 🔐 Default Test Credentials

Register a new account:
- **Name**: John Doe
- **Email**: john@example.com
- **Password**: password123

---

## 📍 Available Routes

### **Public Pages**
- `/` - Landing page with hero section
- `/login` - Login & Registration

### **Protected Pages** (Requires Login)
- `/dashboard` - User dashboard
- `/subscription` - Subscription plans
- `/scores` - Enter and view scores
- `/leaderboard` - Global leaderboard
- `/draw` - Monthly draws & results
- `/charity` - Charity selection

---

## 🏗️ Architecture

### **Frontend** (Next.js 19)
- React 19 with TypeScript
- Tailwind CSS for styling
- Custom 3D canvas animations
- Context API for state management
- Responsive mobile-first design

### **Backend** (Express.js)
- RESTful API
- JWT authentication
- In-memory data storage (easily upgradeable to MongoDB)
- CORS enabled
- Error handling middleware

---

## 📊 Core Features Demo

### **1. Enter a Score**
Navigate to `/scores`, fill in 18-hole scorecard with Stableford format:
- Eagle = 4 points
- Birdie = 3 points
- Par = 2 points
- Bogey = 1 point
- Double = 0 points

### **2. Check Leaderboard**
Visit `/leaderboard` to see:
- Global rankings
- Total points
- Rounds played
- Average per round

### **3. View Draws**
Go to `/draw` to:
- See monthly draw winners
- Create test draws
- View prize pool

### **4. Support a Charity**
Visit `/charity` to:
- Select your preferred charity
- See impact statistics
- Track donations

---

## 🔄 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login user

### **Subscriptions**
- `GET /api/subscriptions/plans` - Get available plans
- `POST /api/subscriptions/create` - Create subscription
- `GET /api/subscriptions/my-subscription` - Get user subscription

### **Scores**
- `POST /api/scores/submit` - Submit score
- `GET /api/scores/my-scores` - Get user scores

### **Leaderboard**
- `GET /api/leaderboard` - Get global leaderboard

### **Draws**
- `POST /api/draws/create-monthly` - Create monthly draw
- `GET /api/draws/latest` - Get latest draws

### **Charities**
- `GET /api/charities` - Get all charities
- `POST /api/charities/set-preference` - Set user preference

### **Users**
- `GET /api/users/profile` - Get user profile

---

## 🎨 Design Highlights

### **Color Scheme**
- Primary: Cyan (#00d4ff)
- Secondary: Blue (#0099ff)
- Accent: Purple/Pink
- Background: Dark slate theme

### **Animations**
- 3D rotating cube in hero
- Floating gradient orbs
- Fade-in text effects
- Smooth transitions
- Hover scale effects

### **Responsive**
- Mobile-first design
- Tablet optimized
- Desktop enhanced
- Touch-friendly buttons

---

## 📱 Mobile Features

- Collapsible navigation menu
- Touch-optimized forms
- Mobile-friendly leaderboard
- Responsive grid layouts
- Optimized performance

---

## 🔮 Future Enhancements

- MongoDB integration (replace in-memory)
- Stripe payment processing
- Email notifications
- Real-time WebSocket updates
- Admin dashboard
- Advanced analytics
- Social features
- Golf course database
- Handicap calculations
- Match play mode

---

## 🛠️ Technology Stack

### **Frontend**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Axios HTTP client

### **Backend**
- Node.js
- Express.js
- JWT authentication
- bcryptjs for passwords
- CORS support

---

## 📝 Project Structure

```
golf-platform/
├── client/
│   └── golf-client/
│       ├── app/
│       │   ├── page.tsx (Landing page)
│       │   ├── layout.tsx
│       │   ├── globals.css
│       │   ├── context/
│       │   │   └── AuthContext.tsx
│       │   ├── login/
│       │   ├── dashboard/
│       │   ├── subscription/
│       │   ├── scores/
│       │   ├── leaderboard/
│       │   ├── draw/
│       │   └── charity/
│       └── package.json
└── server/
    ├── index.js (Main API)
    ├── .env
    └── package.json
```

---

## ✅ PRD Requirements Covered

- ✅ **Subscription Engine** - Monthly/yearly plans
- ✅ **Score Experience** - Stableford format with validation
- ✅ **Custom Draw Engine** - Monthly random draws
- ✅ **Charity Integration** - Charity selection & tracking
- ✅ **Admin Control** - Dashboard for overview
- ✅ **Outstanding UI/UX** - Modern 3D design

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run frontend (port 3000)
npm run dev

# Run backend (port 5000)
npm start

# Build for production
npm run build
```

---

## 💡 Tips

1. **Test Flow**: Home → Login → Subscribe → Enter Score → Check Leaderboard
2. **API Testing**: Use Postman or cURL to test endpoints
3. **Development**: Make changes and see hot reload in browser
4. **Performance**: Next.js handles optimization automatically

---

## 📞 Support

For issues or questions:
1. Check console for errors
2. Verify both frontend and backend are running
3. Ensure proper CORS configuration
4. Check `.env` file setup

---

**Built with ❤️ for the golf community**
