# Project Tool - Backend API

An industrial-grade, production-ready REST API built with **Node.js, Express, and MongoDB**, serving a robust Project Management Tool. This backend features deeply relational Mongoose models and a secure, enterprise-level Role-Based Access Control (RBAC) system.

---

## 🏗 System Architecture

The backend follows a modular monolith architecture, ensuring high scalability and separation of concerns:
- **Controllers**: Contains pure business logic.
- **Models**: Defines strictly typed Mongoose schemas with native MongoDB `ObjectId` relationships.
- **Routes**: API endpoints protected by layered authentication tracking.
- **Middleware**: Highly modularized interceptors for auth, roles, and error handling.
- **Constants**: Centralized configuration (e.g., Role definitions).

---

## 🔐 Role-Based Access Control (RBAC) System

An industrial-standard RBAC system secures the application, ensuring airtight data integrity and preventing unauthorized privilege escalation. 

### Roles Available:
1. **ADMIN**: Full system access. Can manage users, violently delete projects/tasks, and assign new roles.
2. **MANAGER**: Project coordinators. Can create projects, assign tasks, and update statuses, but cannot delete destructive entities or manage users.
3. **MEMBER**: Standard operatives. Can only view projects they are assigned to, and can *only modify tasks directly assigned to their `ObjectId`*.

### Middleware Layers
The security system operates through a sequential pipeline:
1. `authMiddleware.js (protect)`: Extracts JWT (from HTTP-Only cookies or Bearer headers), validates the signature, and attaches the sanitized `req.user` to the request lifecycle. Immediately blocks any user flagged with `isBlocked`.
2. `roleMiddleware.js (authorizeRoles)`: A higher-order function that explicitly whitelists certain roles (e.g., `authorizeRoles(ROLES.ADMIN, ROLES.MANAGER)`). 
3. `ownershipMiddleware.js (checkTaskOwnership)`: For granular operations (like updating a task), this intercepts `MEMBER` requests and strictly verifies that their `_id` matches the `assignedTo` `ObjectId` on the given database document.

### Security Best Practices Implemented:
- JWTs carry both `userId` and `role` internally to prevent unnecessary database sniffing during role verification.
- Passwords hashed automatically using `bcrypt` salting within a User Schema `pre('save')` hook.
- All tokens distributed are bound securely natively using configurations (`sameSite: strict`, `secure`, `httpOnly`).
- Global asynchronous `.catch()` wrapper (`errorHandler.js`) standardizes error responses globally and scrubs raw Stack Traces in Production environments.

---

## 🗄 Relational Database Models

All models were upgraded from simple flat strings to industrial graph-relational structures. 

- **User Model**: Holds `{ role, isBlocked, email, password }` with native indexes setup on `email` and `role` to ensure optimal query performance. 
- **Project Model**: Requires native `Date` types for `dueDate` tracking, and associates specifically to a `createdBy` User `ObjectId`.
- **Task Model**: Exists inside a strict relational triangle. Every task directly maps its `ObjectId` out to an assigned **Project**, an assigned **Team**, and an `assignedTo` **User**.
- **Team Model**: Replaced array of strings with a subdocument schema associating members to their strict `User` ObjectIds, tracking internal team titles (`Lead Architect`, `Backend Engineer`, etc.) and real-time active statuses.

---

## 🚀 API Route Examples

| Route | Method | Description | Access Level |
|---------|----------|---------------|----------------|
| `/api/users/login` | `POST` | Authenticate and retrieve JWT Cookie | Public |
| `/api/projects` | `GET` | View all system projects | `ADMIN`, `MANAGER`, `MEMBER` |
| `/api/projects` | `POST` | Initialize a new project | `ADMIN`, `MANAGER` |
| `/api/projects/:id` | `DELETE` | Terminate a project | **`ADMIN` Only** |
| `/api/tasks/:id` | `PUT` | Update a task's status | `ADMIN`, `MANAGER`, or `MEMBER` (If actively assigned to task) |

---

## 🛠 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose
- **Security**: JSON Web Tokens (JWT), bcrypt
- **Middleware Integration**: cookie-parser, cors
