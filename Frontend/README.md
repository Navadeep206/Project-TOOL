# Project Tool - Frontend Dashboard

A modern, responsive React Single Page Application (SPA) providing a fast, responsive user interface for the Project Management Tool backend. Built with Vite and React.

**Live Demo**: [https://projecttool-eo5y.vercel.app/login](https://projecttool-eo5y.vercel.app/login)

---

## 🚀 Features

- **Blazing Fast**: Powered by Vite and React.
- **Modern UI Styling**: Complete visual structure heavily utilizing Tailwind CSS for a premium SaaS feel.
- **Responsive Navigation**: Adaptable dashboard structures that work across viewports.
- **Standalone Modules**: Incorporates decoupled features designed for extreme modularity.
- **Real-time Updates**: WebSocket integration with Socket.io for live notifications and collaboration.
- **Project Management**: Create, update, and manage projects with team collaboration.

---

## 🏗️ Architecture

### Frontend Architecture
```
Frontend (React + Vite)
├── Pages/Routes (React Router)
│   ├── Dashboard
│   ├── Projects
│   ├── Tasks
│   ├── Team Management
│   ├── Audit Logs
│   └── Activity History
├── Components (Reusable UI)
├── Services (API calls with Axios)
├── Hooks (Custom React hooks)
├── Store (State management)
└── Utils (Helper functions)
```

### Full Stack Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                    │
│              React + Vite + Tailwind CSS               │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS API Calls
┌────────────────────▼────────────────────────────────────┐
│                  Backend Server                         │
│         Node.js + Express.js + Socket.io               │
│                                                         │
│  ├─ REST API Routes (v1/*)                             │
│  ├─ WebSocket Events                                   │
│  ├─ Authentication & Authorization                     │
│  ├─ Role-Based Access Control (RBAC)                   │
│  └─ Business Logic & Validation                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   MongoDB                              │
│         NoSQL Database for Data Storage                │
│         Collections: Projects, Tasks, Users, Logs     │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Audit Log Dashboard (Standalone Module)

A completely decoupled, React-based dashboard was recently integrated to handle Activity Tracking.

### Module Capabilities
1. **Mock-Data Driven**: Operates flawlessly entirely on frontend states using `mockData.js`, enforcing strict decoupling from APIs.
2. **Comprehensive Filters**: Search logs chronologically, by semantic actions (like `CREATE_PROJECT`), or narrow down to successes/failures.
3. **Graceful UI States**: Includes specialized `<SkeletonTable />`, `<EmptyState />`, and `<ErrorState />` components.
4. **Pagination**: Native array slicing to traverse large lists without fetching new data.

It is currently mounted via `<AuditLogDashboard />` under `src/pages/AuditLog/` and can be dropped anywhere in the standard router setup.

*For more details on dropping it into a specific route, read [`AuditLog-Setup.md`](./AuditLog-Setup.md).*

---

## 📅 Activity History Timeline (Standalone Module)

A stunning, responsive vertical timeline designed to map project user activities (`create`, `update`, `status`, etc.). Built intentionally decoupled from existing API requirements.

### Module Capabilities
1. **Zero-Config Backend Dependency**: Renders entirely on mock data via `ActivityTimeline/mockData.js`, acting as a plug-and-play UI feature.
2. **Infinite Scroll Dynamics**: Built-in IntersectionObserver natively paginates the timeline entries mimicking API network latency.
3. **Smart Filters**: Fast `<select>` categorization based on `actionType` to isolate creations, updates, assignments, etc.
4. **Visual Polish**: Includes custom SVG Action Icons, beautiful empty states, and built-in animated loading skeletons for maximum UX.

It is currently housed under `src/components/ActivityTimeline/` and can be utilized anywhere for project overviews.

*For instructions on linking this with backend Express routes, read `ActivityHistory-Setup.md`.*

---

## 🛠 Tech Stack

- **Framework**: React 18
- **Tooling**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (General app layout)
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **State Management**: React Context API
- **Data Fetching**: React Query (TanStack Query)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker & Docker Compose (for containerized setup)

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Navadeep206/Project-TOOL.git
cd Project-TOOL
```

#### 2. Install Dependencies
```bash
# Frontend
cd Frontend
npm install

# Backend (separate terminal)
cd ../Backend
npm install
```

#### 3. Environment Configuration
Create a `.env` file in the root directory based on `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
VITE_API_URL=http://localhost:8080
MONGODB_URI=mongodb://admin:admin123@localhost:27017/projecttool
JWT_SECRET=your-jwt-secret-key
```

#### 4. Start the Development Servers
```bash
# Frontend (from Frontend directory)
npm run dev
# Runs on http://localhost:5173

# Backend (from Backend directory - separate terminal)
npm run dev
# Runs on http://localhost:8080

# MongoDB (make sure MongoDB is running)
# If using Docker: docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo:7
```

---

## 🐳 Docker Setup

### Prerequisites
- Docker
- Docker Compose

### Using Docker Compose (Recommended)

#### 1. Build and Start All Services
```bash
# From project root directory
docker-compose up --build
```

This command will:
- Build the Backend Docker image
- Build the Frontend Docker image
- Create and start a MongoDB service
- Set up networking between containers
- Expose services on specified ports

#### 2. Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **MongoDB**: localhost:27017

#### 3. Stop Services
```bash
docker-compose down
```

#### 4. Remove Volumes (Clean Database)
```bash
docker-compose down -v
```

### Individual Docker Commands

#### Build Backend Image
```bash
docker build -t projecttool-backend:latest ./Backend
```

#### Build Frontend Image
```bash
docker build -t projecttool-frontend:latest ./Frontend
```

#### Run Backend Container
```bash
docker run -d \
  --name projecttool-backend \
  -p 8080:8080 \
  -e MONGODB_URI=mongodb://admin:admin123@mongo:27017/projecttool \
  -e JWT_SECRET=your-secret-key \
  projecttool-backend:latest
```

#### Run Frontend Container
```bash
docker run -d \
  --name projecttool-frontend \
  -p 80:80 \
  projecttool-frontend:latest
```

#### Run MongoDB Container
```bash
docker run -d \
  --name projecttool-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7
```

#### View Container Logs
```bash
# Frontend
docker logs -f projecttool-frontend

# Backend
docker logs -f projecttool-backend

# MongoDB
docker logs -f projecttool-mongo
```

#### Stop and Remove Containers
```bash
docker stop projecttool-frontend projecttool-backend projecttool-mongo
docker rm projecttool-frontend projecttool-backend projecttool-mongo
```

---

## 🌐 Deployment

### Live Application
**Frontend**: [https://projecttool-eo5y.vercel.app/login](https://projecttool-eo5y.vercel.app/login)

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically detect your Vite configuration
4. Set environment variables in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```
5. Click Deploy

---

## 📊 Project Structure

```
Frontend/
├── public/               # Static assets
├── src/
│   ├── pages/           # Route pages
│   │   ├── Dashboard
│   │   ├── Projects
│   │   ├── Tasks
│   │   ├── Team
│   │   └── AuditLog
│   ├── components/      # Reusable components
│   │   ├── ActivityTimeline
│   │   ├── AuditLog
│   │   └── ...
│   ├── services/        # API calls (axios)
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Context/State
│   ├── utils/           # Helper functions
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🔐 Authentication

The application uses JWT-based authentication:
- Login creates a JWT token stored in localStorage
- Token is sent with every API request in the Authorization header
- Token expiration triggers automatic redirect to login page

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m 'Add your feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 📧 Support

For issues and questions, please open an issue on GitHub or contact the development team.
