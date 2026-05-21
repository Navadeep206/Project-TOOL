# Project TOOL - Full Stack Project Management System

A comprehensive, enterprise-grade project management platform built with modern web technologies. Features real-time collaboration, task management, team coordination, and detailed activity tracking.

**🚀 Live Demo**: [https://projecttool-eo5y.vercel.app/login](https://projecttool-eo5y.vercel.app/login)

---

## 📋 Overview

Project TOOL is a full-stack application designed to streamline project management with features including:

- ✅ **Project Management**: Create and manage projects with detailed configurations
- ✅ **Task Management**: Assign tasks, track progress, and manage deadlines
- ✅ **Team Collaboration**: Invite team members, manage roles, and collaborate in real-time
- ✅ **Activity Tracking**: Comprehensive audit logs and activity history
- ✅ **Notifications**: Real-time notifications for project updates
- ✅ **Access Control**: Fine-grained role-based access control (RBAC)
- ✅ **Approval Workflows**: Multi-step approval processes for sensitive operations

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                       │
│              Vercel - React + Vite                      │
│          (TypeScript, Tailwind CSS, Socket.io)         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS / WebSocket
┌────────────────────▼────────────────────────────────────┐
│                  Backend Layer                          │
│         Node.js + Express.js + Socket.io               │
│                                                         │
│  ├─ REST API (v1/*)                                    │
│  ├─ WebSocket Server                                   │
│  ├─ Authentication & JWT                               │
│  ├─ Authorization & RBAC                               │
│  ├─ Business Logic                                     │
│  ├─ Email Service                                      │
│  └─ Job Scheduling (Node-Cron)                         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Data Layer                             │
│                MongoDB NoSQL Database                   │
│                                                         │
│  Collections:                                           │
│  ├─ users (authentication & profiles)                  │
│  ├─ projects (project data)                            │
│  ├─ tasks (task management)                            │
│  ├─ teams (team organization)                          │
│  ├─ notifications (user notifications)                 │
│  ├─ activities (activity logs)                         │
│  ├─ auditLogs (system audit trail)                     │
│  ├─ approvals (approval workflows)                     │
│  └─ invitations (team invites)                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Project-TOOL/
├── Backend/                          # Express.js Server
│   ├── config/                       # Configuration files
│   ├── controllers/                  # Request handlers
│   ├── models/                       # MongoDB schemas
│   ├── routes/                       # API endpoints
│   ├── middleware/                   # Custom middleware
│   ├── services/                     # Business logic
│   ├── jobs/                         # Scheduled jobs
│   ├── socket/                       # WebSocket handlers
│   ├── utils/                        # Utility functions
│   ├── validation/                   # Input validation
│   ├── scripts/                      # Database scripts
│   ├── Dockerfile                    # Docker configuration
│   ├── package.json
│   ├── server.js                     # Entry point
│   └── app.js                        # Express app setup
│
├── Frontend/                         # React + Vite App
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── pages/                    # Page components
│   │   ├── components/               # Reusable components
│   │   ├── services/                 # API calls
│   │   ├── hooks/                    # Custom hooks
│   │   ├── store/                    # State management
│   │   ├── utils/                    # Utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile                    # Docker configuration
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── nginx.conf                    # Nginx configuration
│
├── docker-compose.yml                # Docker Compose orchestration
├── .dockerignore                     # Docker build ignore file
├── .env.example                      # Environment variables template
└── README.md                         # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (for development)
- **npm** or **yarn**
- **Docker** & **Docker Compose** (optional, for containerized setup)
- **MongoDB** (included in Docker Compose)

### Installation

#### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/Navadeep206/Project-TOOL.git
cd Project-TOOL

# Start all services
docker-compose up --build
```

Access:
- Frontend: http://localhost
- Backend API: http://localhost:8080
- MongoDB: localhost:27017

#### Option 2: Local Development

```bash
# Backend Setup
cd Backend
npm install
cp .env .env.local  # Configure your environment
npm run dev

# Frontend Setup (new terminal)
cd Frontend
npm install
npm run dev
```

---

## 🐳 Docker Commands

### Docker Compose Commands

```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# Remove volumes (clears database)
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo
```

### Individual Docker Commands

```bash
# Build images
docker build -t projecttool-backend ./Backend
docker build -t projecttool-frontend ./Frontend

# Run containers
docker run -d -p 8080:8080 --name backend projecttool-backend
docker run -d -p 80:80 --name frontend projecttool-frontend
docker run -d -p 27017:27017 --name mongo mongo:7

# Stop/Remove containers
docker stop backend frontend mongo
docker rm backend frontend mongo

# View container stats
docker stats
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `POST /api/users/refresh-token` - Refresh JWT token

### Projects
- `GET /api/v1/projects` - List all projects
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Tasks
- `GET /api/v1/tasks` - List all tasks
- `POST /api/v1/tasks` - Create new task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### Teams
- `GET /api/v1/teams` - List teams
- `POST /api/v1/teams` - Create team
- `POST /api/v1/teams/:id/members` - Add team member

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read

### Activity & Audit
- `GET /api/v1/activities` - Get activity history
- `GET /api/v1/audit-logs` - Get audit logs

---

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Fine-grained permissions
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Cross-origin resource sharing control
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive validation on all inputs
- **Audit Logging**: Complete audit trail of all actions
- **Helmet.js**: HTTP security headers

---

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
# Backend
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb://admin:admin123@mongo:27017/projecttool
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRE=7d

# Frontend
VITE_API_URL=http://localhost:8080

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=admin123
```

---

## 🚀 Deployment

### Vercel Deployment (Frontend)

1. Push code to GitHub
2. Connect GitHub repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

**Live URL**: [https://projecttool-eo5y.vercel.app/login](https://projecttool-eo5y.vercel.app/login)

### Backend Deployment Options
- **AWS EC2** with Docker
- **Heroku** with Docker
- **DigitalOcean** App Platform
- **Railway**
- **Render**

---

## 📚 Features in Detail

### Project Management
- Create, update, delete projects
- Set project metadata and descriptions
- Assign project owners and members
- Track project status and progress

### Task Management
- Create and assign tasks to team members
- Set priorities, deadlines, and status
- Track task progress and completion
- Activity timeline for each task

### Team Collaboration
- Invite team members via email
- Manage team roles and permissions
- Real-time notifications
- Activity feed

### Access Control
- Temporary access with expiration dates
- Access cleanup jobs
- Multi-role support
- Approval workflows for sensitive operations

### Notifications
- Real-time notifications via Socket.io
- Email notifications
- Notification preferences
- Mark as read/unread

---

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **Task Scheduling**: Node-Cron
- **Security**: Helmet.js, bcryptjs, CORS
- **Rate Limiting**: express-rate-limit

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **State Management**: React Context API
- **Data Fetching**: React Query (TanStack Query)
- **UI Components**: Custom + Tailwind

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Version Control**: Git
- **CI/CD**: GitHub Actions (optional)
- **Hosting**: Vercel (Frontend), Custom VPS (Backend)

---

## 📈 Performance Optimizations

- ✅ Code splitting with Vite
- ✅ Image optimization
- ✅ Lazy loading of routes
- ✅ API response caching
- ✅ Database indexing
- ✅ Connection pooling
- ✅ Gzip compression

---

## 🧪 Testing

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test
```

---

## 📝 License

This project is licensed under the ISC License - see LICENSE file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📧 Support & Contact

For questions, issues, or suggestions:
- Open an issue on [GitHub Issues](https://github.com/Navadeep206/Project-TOOL/issues)
- Contact: gudurunavadeep12@gmail.com

---

## 🎯 Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced reporting and analytics
- [ ] Gantt chart visualization
- [ ] Kanban board improvements
- [ ] Calendar integration
- [ ] API documentation (Swagger)
- [ ] Performance monitoring
- [ ] Advanced search capabilities

---

**Made with ❤️ by Navadeep**
