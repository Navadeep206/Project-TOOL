# Temporary Access System Implementation Guide

This guide details exactly how to hook the decoupled Expiry Engine into your existing infrastructure without modifying or breaking current workflows.

## 1. Schema Injection

Because replacing your `User.model.js` completely is highly risky to your existing DB rules, I have generated a modular extension file (`Backend/models/userAccess.extension.js`).

**Action required:**
1. Open your actual `User` model.
2. Manually drop those 4 new fields (`accessType`, `accessExpiresAt`, `grantedBy`, `grantReason`) into your actual Schema object. Be sure to add `isActive: true` if you don't already have an active-toggle field.

## 2. API Routing Hookup

Your new Admin APIs (`/api/v1/access`) handle granting/revoking durations explicitly.

**Action required:**
In your `app.js` or `server.js`:
```javascript
import accessRoutes from './routes/access.routes.js';

// Important: Protect this with your isAdmin middleware!
app.use('/api/v1/access', [isAuthenticated, isAdmin], accessRoutes);
```

## 3. Global Gatekeeper Middleware

The `accessExpiryMiddleware` serves to intercept and silently block tokens matching expired dates.

**Action required:**
In your `app.js` (or on your main API router wrapper):
```javascript
import { accessExpiryMiddleware } from './middleware/accessExpiryMiddleware.js';

// Place it AFTER your JWT logic so `req.user` exists, but BEFORE your actual business routes!
app.use('/api/v1', isAuthenticated, accessExpiryMiddleware);
```

*(This guarantees NO expired user can bypass the system, even if they have a valid unexpired 30-day JWT JWT).*

## 4. The Reaper Cron Job

The Cron job runs every 60 minutes actively seeking out documents where `accessExpiresAt < Date.now()` and flipping their `isActive` flag to false directly in the database.

**Action required:**
In your main `server.js` (near your database connection):
```javascript
import './jobs/accessCleanup.js'; // Starts the cron tick infinitely
```
