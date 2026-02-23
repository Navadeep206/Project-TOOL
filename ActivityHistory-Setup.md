# Activity History Module Integration Guide

This guide explains how to integrate the newly generated "Activity History" system into your existing application without breaking current logic.

## 1. Backend Setup

### Mount Routes
In your `app.js` or `server.js`, simply import the activity routes and mount them to a specific endpoint. 

```javascript
import activityRoutes from './routes/activity.routes.js';
// Make sure to add authentication/authorization middleware before it!
app.use('/api/v1/activities', activityRoutes);
```

### Auto-Track Middleware (The Plugin Approach)
You don't need to rewrite your controllers to save an activity. You can simply inject the middleware into your existing route declarations.

Example inside `task.routes.js`:

```javascript
import { trackActivity } from '../middleware/activity.middleware.js';

// Existing setup
// router.patch('/:taskId', updateTask);

// New setup (Non-disruptive hook)
router.patch('/:taskId', trackActivity({ entityType: 'task', actionType: 'update' }), updateTask);
```
*(Make sure your route parameters contain the `projectId` or the controller adds it to `res.locals.project._id` before the response finishes).*

### Schema Synchronization
If you run `mongoose.connect()`, the new `Activity` model will construct its indexes automatically on boot. No explicit migration script is required unless you want to seed past data.

---

## 2. Frontend Setup (Standalone Component)

The created React Component (`ActivityTimeline.jsx`) uses mock data and renders perfectly disconnected.

### Usage
Import and use it anywhere in your Project Detail page:

```jsx
import ActivityTimeline from '../components/ActivityTimeline/ActivityTimeline';

function ProjectDashboard() {
  return (
    <div>
      {/* Your other components */}
      
      {/* Drop in the Timeline */}
      <div className="mt-10">
        <ActivityTimeline />
      </div>
    </div>
  );
}
```

### Future API Hookup
When ready to replace mock data with the real backend:
1. Replace the `setTimeout` inside `ActivityTimeline.useEffect` with a standard `axios.get` or `fetch` querying `/api/v1/activities/project/:projectId`.
2. Ensure you pass query params like `?page=${page}&limit=5`.
3. Update state with `res.data.data.activities`.
