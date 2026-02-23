# Audit Log Backend Integration Setup

To use the standalone Audit Log module, simply drop the provided files into your Mongoose/Express application.

## 1. Environment & Dependencies
Make sure you have `json2csv` installed if you want the CSV export functionality to work:
```bash
npm install json2csv
```

## 2. Model Usage
The model is located at `models/AuditLog.js`. It tracks `action`, `resourceType` (e.g. project, user, auth), `userId`, `ipAddress`, etc.

## 3. Register Routes (Admin Only)
In your main `app.js` or `server.js`, integrate the read-only routes for admins.
```javascript
import auditLogRoutes from './routes/auditLogRoutes.js';

// Important: Protect this route with your admin authentication middleware!
app.use('/api/audit-logs', auditLogRoutes);
```

## 4. Integrate Middleware
To start tracking actions automatically without changing your existing API logic, apply the middleware to your routes.

### Example: Tracking Auth Failures (for App-level)
```javascript
import { auditAuthError } from './middleware/auditMiddleware.js';

// Put this globally to track all 401 / 403 responses
app.use(auditAuthError);
```

### Example: Tracking Specific Actions (for Route-level)
```javascript
import { auditAction } from '../middleware/auditMiddleware.js';
import express from 'express';
const router = express.Router();

// Wrap a specific action
router.post('/projects', auditAction('CREATE_PROJECT', 'project'), projectController.create);
router.delete('/projects/:id', auditAction('DELETE_PROJECT', 'project'), projectController.delete);
```

## 5. Direct Service Use
If you need to log something custom (like a deep internal service failure):
```javascript
import { auditService } from '../services/auditLogService.js';

auditService.logAction({
  action: 'CUSTOM_CRON_JOB',
  resourceType: 'system',
  description: 'Running nightly project cleanup',
  status: 'success'
});
```

*Remember:* The service executes `setImmediate` internally, so `await auditService.logAction()` is non-blocking and safe for fast API responses.
