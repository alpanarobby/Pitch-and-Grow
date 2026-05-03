# 🚀 Pitch & Groww

> A web-based platform to register, track, and boost startup engagement through real-time analytics and smart scoring.

---

## 📁 Project Structure

```
pitch-and-groww/
├── backend/           # Node.js + Express + MongoDB API
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API route handlers
│   ├── middleware/    # Auth middleware
│   └── server.js      # Entry point
└── frontend/          # React application
    └── src/
        ├── context/   # Auth context & Axios
        ├── pages/     # All page components
        ├── components/# Navbar, Sidebar
        └── App.js     # Routes
```

---

## ⚡ Quick Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1. Clone & Install

```bash
# Backend
cd pitch-and-groww/backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2. Configure Environment

```bash
# In backend/ folder, copy and edit env:
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pitch-and-groww
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

For **MongoDB Atlas** (cloud), replace MONGODB_URI with your Atlas connection string.

---

### 3. Run the App

```bash
# Terminal 1: Start backend
cd backend
npm run dev        # uses nodemon for hot reload
# OR
npm start

# Terminal 2: Start frontend
cd frontend
npm start
```

Open: **http://localhost:3000**

---

## 🔑 User Roles

### Startup Founders
- Register with department/university info
- Submit startup ideas with full details
- Track live engagement scores
- View analytics dashboard (views, likes, investor interest)
- Accept/decline investor connection requests
- Chat with investors after accepting connections

### Investors
- Browse all startups with filtering & search
- View engagement scores and analytics
- Like, bookmark, and express interest in startups
- Send connection requests to founders
- Chat with founders after connection accepted
- Dashboard with portfolio overview

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register founder or investor |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/auth/notifications` | Get notifications |

### Startups
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/startups` | Register startup (founder) |
| GET | `/api/startups` | Browse all startups |
| GET | `/api/startups/my` | My startups (founder) |
| GET | `/api/startups/:id` | Get startup details |
| PUT | `/api/startups/:id` | Update startup |
| POST | `/api/startups/:id/like` | Like/unlike |
| POST | `/api/startups/:id/bookmark` | Bookmark/unbookmark |
| POST | `/api/startups/:id/interest` | Express investor interest |

### Connections
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/connections` | Send connection request |
| GET | `/api/connections` | Get all connections |
| PUT | `/api/connections/:id` | Accept/decline (founder) |
| POST | `/api/connections/:id/message` | Send chat message |
| GET | `/api/connections/:id/messages` | Get chat messages |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/founder` | Founder analytics |
| GET | `/api/analytics/platform` | Platform stats |

---

## 📊 Engagement Score Formula

The score (0–100) is calculated dynamically:
- **Views** → up to 20 points
- **Likes** → up to 25 points  
- **Bookmarks** → up to 15 points
- **Investor Interest** → up to 25 points
- **Profile Completeness** → up to 15 points

Score updates on every interaction and refreshes every 30 seconds on dashboards.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Styling | Custom CSS with CSS Variables |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| HTTP | Axios |
| Notifications | react-hot-toast |

---

## 🚀 Deployment

### Backend (Railway / Render / Heroku)
1. Set environment variables
2. Set start command: `node server.js`
3. Deploy from git

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL=https://your-backend-url.com/api`
2. Build command: `npm run build`
3. Deploy build folder

---

## 📌 Features Summary

- ✅ Role-based auth (Founder / Investor)
- ✅ Startup registration with department & university info
- ✅ Smart engagement scoring (live, auto-updating)
- ✅ Real-time dashboards with charts
- ✅ Browse & filter startups (category, stage, search)
- ✅ Like, bookmark, express interest
- ✅ Investor → Founder connection requests
- ✅ In-app messaging after connection accepted
- ✅ Push notifications system
- ✅ Full profile management

---

Made with ❤️ for student entrepreneurs.
